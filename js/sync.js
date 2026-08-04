/* Synchronizacja z Firestore.

   Kolejność jest tu istotna: localStorage odpowiada za pierwszy render (zero
   mignięcia pustym ekranem przy starcie), Firestore jest źródłem prawdy i
   dosyła zmiany przez onSnapshot. Bez logowania cały ten plik śpi i aplikacja
   działa w całości lokalnie.

   Firebase ładujemy dynamicznym importem, a nie statycznym — dzięki temu przy
   pustej konfiguracji przeglądarka w ogóle nie odpytuje CDN. */

import { firebaseConfig, FIREBASE_VERSION, FIRESTORE_DATABASE_ID, isConfigured } from './firebase/config.js';
import * as store from './store.js';

const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

let fb = null;               // funkcje zaimportowane z SDK
let auth = null;
let db = null;
let currentUid = null;
let unsubscribes = [];

let statusHandler = () => {};
let userHandler = () => {};

export const STATUS = {
    LOCAL: 'local',
    SYNCED: 'synced',
    PENDING: 'pending',
    OFFLINE: 'offline',
    ERROR: 'error'
};

export function onStatus(handler) {
    statusHandler = handler;
}

export function onUser(handler) {
    userHandler = handler;
}

/* ---------- Start ---------- */

export async function initSync() {
    if (!isConfigured()) {
        statusHandler(STATUS.LOCAL);
        return false;
    }

    const [appModule, authModule, storeModule] = await Promise.all([
        import(`${CDN}/firebase-app.js`),
        import(`${CDN}/firebase-auth.js`),
        import(`${CDN}/firebase-firestore.js`)
    ]);

    fb = { ...authModule, ...storeModule };
    const app = appModule.initializeApp(firebaseConfig);
    auth = fb.getAuth(app);

    /* Trwały cache na wielu kartach — bez tego wyłączenie sieci w trakcie
       logowania sesji gubiłoby zapisy zamiast je kolejkować. */
    db = fb.initializeFirestore(app, {
        localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() })
    }, FIRESTORE_DATABASE_ID);

    /* Logowanie przez redirect kończy się dopiero po powrocie na stronę. */
    try {
        await fb.getRedirectResult(auth);
    } catch (error) {
        reportAuthError(error);
    }

    fb.onAuthStateChanged(auth, handleUserChange);
    return true;
}

/* ---------- Logowanie ---------- */

/* W trybie standalone na iOS okienko popup potrafi nie wrócić do aplikacji —
   tam jedyną działającą ścieżką jest redirect. */
function isStandalone() {
    return window.navigator.standalone === true
        || window.matchMedia('(display-mode: standalone)').matches;
}

export async function signIn() {
    if (!auth) throw new Error('Firebase nie jest skonfigurowany.');

    const provider = new fb.GoogleAuthProvider();
    if (isStandalone()) return fb.signInWithRedirect(auth, provider);

    try {
        await fb.signInWithPopup(auth, provider);
    } catch (error) {
        /* Zablokowany popup to nie błąd konfiguracji — próbujemy redirectem. */
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
            return fb.signInWithRedirect(auth, provider);
        }
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return;
        throw error;
    }
}

export async function signOutUser() {
    if (auth) await fb.signOut(auth);
}

/* Komunikaty po polsku — ciche console.error nic użytkownikowi nie mówi. */
export function describeAuthError(error) {
    switch (error?.code) {
        case 'auth/unauthorized-domain':
            return 'Ta domena nie jest dopuszczona w Firebase Console → Authentication → Settings → Authorized domains.';
        case 'auth/network-request-failed':
            return 'Brak połączenia z siecią. Dane zapisują się lokalnie i dosyłają po powrocie online.';
        case 'auth/web-storage-unsupported':
            return 'Safari blokuje magazyn stron trzecich. Wyłącz „Zapobiegaj śledzeniu między witrynami” dla tej strony.';
        default:
            return `Logowanie nie powiodło się: ${error?.message ?? error}`;
    }
}

function reportAuthError(error) {
    if (!error) return;
    statusHandler(STATUS.ERROR, describeAuthError(error));
}

/* ---------- Reakcja na zmianę użytkownika ---------- */

async function handleUserChange(user) {
    unsubscribes.forEach(unsubscribe => unsubscribe());
    unsubscribes = [];
    store.setRemote(null);
    currentUid = user?.uid ?? null;

    userHandler(user);

    if (!user) {
        statusHandler(STATUS.LOCAL);
        return;
    }

    registerRemote(user.uid);
    subscribe(user.uid);

    try {
        await mergeLocalUp(user.uid);
        await saveProfile(user);
    } catch (error) {
        statusHandler(STATUS.ERROR, `Nie udało się wysłać lokalnych danych: ${error.message}`);
    }
}

/* ---------- Zapisy wychodzące ---------- */

function docRef(...path) {
    return fb.doc(db, 'users', currentUid, ...path);
}

/* Zapisy są celowo bez await: offline Firestore kolejkuje je w swoim cache
   i rozwiąże obietnicę dopiero po powrocie sieci. Czekanie zablokowałoby UI. */
function push(promise) {
    promise.catch(error => statusHandler(STATUS.ERROR, `Zapis nie przeszedł: ${error.message}`));
}

function registerRemote(uid) {
    currentUid = uid;

    store.setRemote({
        saveSession: session => push(fb.setDoc(docRef('sessions', session.id), session)),
        deleteSession: id => push(fb.deleteDoc(docRef('sessions', id))),
        saveWeight: entry => push(fb.setDoc(docRef('weights', entry.id), entry)),
        savePlan: plan => push(fb.setDoc(docRef('plan', 'current'), plan)),
        saveSettings: settings => push(fb.setDoc(fb.doc(db, 'users', uid), settings, { merge: true }))
    });
}

function saveProfile(user) {
    return fb.setDoc(
        fb.doc(db, 'users', user.uid),
        { displayName: user.displayName ?? '', email: user.email ?? '' },
        { merge: true }
    );
}

/* ---------- Nasłuch ---------- */

function updateStatus(metadata) {
    if (metadata.hasPendingWrites) return statusHandler(STATUS.PENDING);
    if (metadata.fromCache) return statusHandler(STATUS.OFFLINE);
    statusHandler(STATUS.SYNCED);
}

function subscribe(uid) {
    const options = { includeMetadataChanges: true };

    const watchCollection = (name, apply, remove) => fb.onSnapshot(
        fb.collection(db, 'users', uid, name),
        options,
        snapshot => {
            updateStatus(snapshot.metadata);
            snapshot.docChanges().forEach(change => {
                /* Echo własnego zapisu — dane już są w localStorage, ponowne
                   nałożenie tylko przerysowałoby widok pod palcami. */
                if (change.doc.metadata.hasPendingWrites) return;
                if (change.type === 'removed') remove(change.doc.id);
                else apply(change.doc.data());
            });
        },
        error => statusHandler(STATUS.ERROR, `Sync przerwany: ${error.message}`)
    );

    const watchDoc = (ref, apply) => fb.onSnapshot(ref, options, snapshot => {
        if (snapshot.metadata.hasPendingWrites || !snapshot.exists()) return;
        apply(snapshot.data());
    });

    unsubscribes.push(
        watchCollection('sessions', store.applyRemoteSession, store.applyRemoteSessionRemoval),
        watchCollection('weights', store.applyRemoteWeight, () => {}),
        watchDoc(fb.doc(db, 'users', uid, 'plan', 'current'), store.applyRemotePlan),
        watchDoc(fb.doc(db, 'users', uid), store.applyRemoteSettings)
    );
}

/* ---------- Merge lokalnych danych po zalogowaniu ---------- */

/* Wysyłamy w górę to, czego zdalnie nie ma albo co lokalnie jest nowsze.
   Reszta dojedzie w dół przez onSnapshot. */
async function mergeLocalUp(uid) {
    await mergeCollection(uid, 'sessions', store.getSessions());
    await mergeCollection(uid, 'weights', store.getWeights());

    const planRef = fb.doc(db, 'users', uid, 'plan', 'current');
    const planSnapshot = await fb.getDoc(planRef);
    const localPlan = store.getPlan();

    if (!planSnapshot.exists() || (localPlan.updatedAt ?? 0) > (planSnapshot.data().updatedAt ?? 0)) {
        await fb.setDoc(planRef, localPlan);
    }
}

async function mergeCollection(uid, name, localItems) {
    const snapshot = await fb.getDocs(fb.collection(db, 'users', uid, name));
    const remoteItems = new Map(snapshot.docs.map(document => [document.id, document.data()]));

    for (const item of localItems) {
        const existing = remoteItems.get(item.id);
        if (!existing || (item.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
            await fb.setDoc(fb.doc(db, 'users', uid, name, item.id), item);
        }
    }
}

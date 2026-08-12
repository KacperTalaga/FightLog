/* Punkt wejścia aplikacji: montuje widoki, obsługuje nawigację i logowanie. */

import { $, $$ } from './utils.js';
import { onChange } from './store.js';
import { initSync, signIn, signOutUser, onStatus, onUser, describeAuthError, STATUS } from './sync.js';
import { toast } from './toast.js';
import { mountPlan } from './views/plan.js';
import { mountLog } from './views/log.js';
import { mountProgress } from './views/progress.js';
import { mountDiet } from './views/diet.js';
import { mountKnowledge } from './views/knowledge.js';

/* Klucz widoku = wartość data-view na przycisku = sufiks id kontenera. */
const VIEWS = {
    plan: mountPlan,
    log: mountLog,
    progress: mountProgress,
    diet: mountDiet,
    knowledge: mountKnowledge
};

const STATUS_LABELS = {
    [STATUS.LOCAL]: 'Tylko lokalnie',
    [STATUS.SYNCED]: 'Zsynchronizowane',
    [STATUS.PENDING]: 'Oczekuje na sync',
    [STATUS.OFFLINE]: 'Offline — dane w kolejce',
    [STATUS.ERROR]: 'Błąd synchronizacji'
};

let signedInUser = null;

function switchView(name) {
    /* Przemontowanie widoku przy wejściu — dane mogły się zmienić w innej
       zakładce (sesja zapisana w logu podnosi sugestie w planie). */
    VIEWS[name]($(`#view-${name}`));

    $$('.tab-bar__btn').forEach(button => {
        button.classList.toggle('is-active', button.dataset.view === name);
        button.setAttribute('aria-current', button.dataset.view === name ? 'page' : 'false');
    });

    $$('.view').forEach(view => {
        view.classList.toggle('is-active', view.id === `view-${name}`);
    });

    window.scrollTo(0, 0);
}

function activeView() {
    return $$('.tab-bar__btn').find(button => button.classList.contains('is-active'))?.dataset.view;
}

/* Zmiana przyszła z Firestore. Nie przerysowujemy widoku, gdy użytkownik ma
   kursor w polu — w środku serii to by mu zabrało to, co właśnie wpisuje. */
function handleRemoteChange() {
    const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (editing) return;

    const name = activeView();
    if (name) VIEWS[name]($(`#view-${name}`));
}

/* ---------- Logowanie ---------- */

function renderAuth() {
    const label = $('#auth-label');
    if (!label) return;

    label.textContent = signedInUser
        ? (signedInUser.displayName?.split(' ')[0] ?? 'Konto')
        : 'Zaloguj';
}

function setSyncStatus(status, message) {
    const dot = $('#sync-dot');
    if (dot) {
        dot.dataset.status = status;
        dot.title = STATUS_LABELS[status] ?? status;
    }
    if (status === STATUS.ERROR && message) toast(message);
}

async function handleAuthClick() {
    if (signedInUser) {
        if (confirm('Wylogować się? Dane zostaną na tym urządzeniu.')) await signOutUser();
        return;
    }

    try {
        await signIn();
    } catch (error) {
        toast(describeAuthError(error));
    }
}

function wireAuth() {
    const button = $('#auth-btn');

    onUser(user => {
        signedInUser = user;
        renderAuth();
        handleRemoteChange();
    });

    onStatus(setSyncStatus);
    button.addEventListener('click', handleAuthClick);
    renderAuth();
}

/* ---------- Service worker ---------- */

let reloading = false;
let updatePrompted = false;

/* Nowa wersja nie wchodzi sama — użytkownik może być w środku serii.
   Toast czeka na dotknięcie, dopiero potem przeładowujemy.

   Dwa źródła aktualizacji: zmiana samego sw.js (jest wtedy worker w stanie
   waiting) albo zmiana plików aplikacji wykryta przez service workera
   (wtedy wystarczy przeładowanie). */
function promptUpdate(worker) {
    if (updatePrompted) return;
    updatePrompted = true;

    const element = toast('Nowa wersja — dotknij, żeby odświeżyć', 30000);
    element.classList.add('toast--action');
    element.addEventListener('click', () => {
        element.remove();

        if (worker) return worker.postMessage({ type: 'SKIP_WAITING' });
        reloading = true;
        window.location.reload();
    });
}

function watchForUpdate(registration) {
    if (registration.waiting) promptUpdate(registration.waiting);

    registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener('statechange', () => {
            /* Brak controllera = pierwsza instalacja, a nie aktualizacja —
               wtedy nie ma o czym informować. */
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                promptUpdate(installing);
            }
        });
    });
}

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        window.location.reload();
    });

    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'CONTENT_UPDATED') promptUpdate(null);
    });

    try {
        watchForUpdate(await navigator.serviceWorker.register('./sw.js'));
    } catch (error) {
        /* Brak trybu offline nie może wywalić aplikacji — reszta działa. */
        console.warn('FightLog: service worker nie wystartował', error);
    }
}

/* ---------- Start ---------- */

function init() {
    Object.entries(VIEWS).forEach(([name, mount]) => mount($(`#view-${name}`)));

    $$('.tab-bar__btn').forEach(button => {
        button.addEventListener('click', () => switchView(button.dataset.view));
    });

    onChange(handleRemoteChange);
    wireAuth();

    /* Brak konfiguracji Firebase nie może zatrzymać aplikacji — tryb lokalny
       jest pełnoprawny, sync to dodatek. */
    initSync().catch(error => {
        setSyncStatus(STATUS.ERROR);
        toast(`Firebase nie wystartował: ${error.message}`);
    });

    registerServiceWorker();
}

/* Skrypt jest modułem, więc wykonuje się po sparsowaniu DOM — bez DOMContentLoaded. */
init();

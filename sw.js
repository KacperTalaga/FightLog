/* Service worker — offline i aktualizacje.

   CACHE_NAME nie wymaga podnoszenia przy wdrożeniach. Szkielet jest serwowany
   strategią stale-while-revalidate: strona startuje natychmiast z cache'a,
   a w tle każdy plik jest sprawdzany warunkowo (ETag). Gdy serwer odda inną
   wersję, cache się aktualizuje i aplikacja pokazuje toast o nowej wersji.

   Poprzednia strategia (cache-first z ręcznym wersjonowaniem) wymagała
   pamiętania o podbiciu numeru przy każdym deployu — jedno zapomnienie
   i przeglądarka serwowała starą wersję w nieskończoność. */

const CACHE_NAME = 'fightlog-v1';

/* Szkielet aplikacji. Lista jest pilnowana testem (tests/check.mjs) —
   plik dodany do js/ albo css/ i pominięty tutaj nie zadziała offline. */
const SHELL = [
    './',
    './index.html',
    './manifest.json',
    './css/tokens.css',
    './css/base.css',
    './css/components.css',
    './css/log.css',
    './css/progress.css',
    './css/diet.css',
    './css/knowledge.css',
    './js/app.js',
    './js/store.js',
    './js/sync.js',
    './js/progression.js',
    './js/stats.js',
    './js/nutrition.js',
    './js/chart.js',
    './js/timer.js',
    './js/toast.js',
    './js/utils.js',
    './js/data/plan.js',
    './js/data/session.js',
    './js/data/muscles.js',
    './js/data/knowledge.js',
    './js/firebase/config.js',
    './js/views/plan.js',
    './js/views/log.js',
    './js/views/progress.js',
    './js/views/diet.js',
    './js/views/knowledge.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png'
];

/* Moduły Firebase z CDN: network-first, bo chcemy poprawki SDK,
   ale z fallbackiem na cache, żeby offline aplikacja w ogóle wstała. */
const CDN_HOST = 'www.gstatic.com';

/* Ruch do API Firebase nie może przejść przez cache — Firestore ma własną
   warstwę offline (persistentLocalCache) i to ona kolejkuje zapisy.
   Podwójne buforowanie dawałoby nieaktualne odpowiedzi i zerwane sesje. */
const BYPASS_HOSTS = [
    'firestore.googleapis.com',
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
    'www.googleapis.com',
    'apis.google.com',
    'accounts.google.com'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

/* Nowa wersja czeka, aż użytkownik kliknie toast — dopiero wtedy przejmuje
   kontrolę. Podmiana w trakcie zapisywania serii gubiłaby stan strony. */
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (BYPASS_HOSTS.includes(url.hostname)) return;

    if (url.hostname === CDN_HOST) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(event));
    }
});

/* ---------- Wykrywanie nowej wersji ---------- */

let updateAnnounced = false;

/* Jedno powiadomienie na cykl życia workera — przy 30 plikach szkieletu
   użytkownik dostałby inaczej 30 identycznych toastów. */
async function announceUpdate() {
    if (updateAnnounced) return;
    updateAnnounced = true;

    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.postMessage({ type: 'CONTENT_UPDATED' }));
}

/* Porównujemy walidatory HTTP. Gdy serwer nie daje żadnego, wolimy milczeć niż
   ogłaszać aktualizację przy każdym odświeżeniu. */
function hasChanged(cached, fresh) {
    for (const header of ['etag', 'last-modified', 'content-length']) {
        const before = cached.headers.get(header);
        const after = fresh.headers.get(header);
        if (before && after) return before !== after;
    }
    return false;
}

async function putInCache(request, response) {
    /* Tylko pełne odpowiedzi 200. Zbuforowany błąd 404 albo odpowiedź
       częściowa (206) zostałaby z użytkownikiem do końca życia cache'a. */
    if (!response || response.status !== 200 || response.type === 'opaque') return response;

    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    return response;
}

async function staleWhileRevalidate(event) {
    const request = event.request;
    const cached = await caches.match(request);

    const fromNetwork = fetch(request)
        .then(async response => {
            if (cached && hasChanged(cached, response)) await announceUpdate();
            return putInCache(request, response);
        })
        .catch(() => null);

    if (cached) {
        /* Odpowiadamy z cache'a natychmiast, ale przeglądarka nie może ubić
           workera przed dokończeniem odświeżenia w tle. */
        event.waitUntil(fromNetwork);
        return cached;
    }

    const response = await fromNetwork;
    if (response) return response;

    /* Offline i pudło w cache'u: wejście w dowolny adres w obrębie aplikacji
       ma pokazać powłokę, a nie błąd przeglądarki. */
    if (request.mode === 'navigate') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
    }

    return Response.error();
}

async function networkFirst(request) {
    try {
        return await putInCache(request, await fetch(request));
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw error;
    }
}

/* Service worker — offline i aktualizacje.

   Podnieś CACHE_NAME przy każdym wdrożeniu. Strategia cache-first oznacza,
   że bez zmiany nazwy cache'a przeglądarka będzie serwowała stare pliki
   w nieskończoność. */

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
        event.respondWith(cacheFirst(request));
    }
});

async function putInCache(request, response) {
    /* Tylko pełne odpowiedzi 200. Zbuforowany błąd 404 albo odpowiedź
       częściowa (206) zostałaby z użytkownikiem do końca życia cache'a. */
    if (!response || response.status !== 200 || response.type === 'opaque') return response;

    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
    return response;
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        return await putInCache(request, await fetch(request));
    } catch (error) {
        /* Offline i pudło w cache'u: wejście w dowolny adres w obrębie
           aplikacji ma pokazać powłokę, a nie błąd przeglądarki. */
        if (request.mode === 'navigate') {
            const shell = await caches.match('./index.html');
            if (shell) return shell;
        }
        throw error;
    }
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

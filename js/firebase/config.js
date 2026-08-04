/* Konfiguracja projektu Firebase.

   apiKey w konfiguracji webowej Firebase JEST PUBLICZNY z założenia — trafia
   do przeglądarki każdego użytkownika i nie da się go ukryć. Bezpieczeństwo
   zapewniają reguły w firestore.rules, które przepuszczają wyłącznie zapisy
   do users/{uid} właściciela sesji. Nie kombinuj z chowaniem tego klucza.

   Puste pola = tryb wyłącznie lokalny: aplikacja działa w całości na
   localStorage i nie pobiera niczego z CDN. */

export const firebaseConfig = {
    apiKey: 'AIzaSyA8iM6oQxs7UQYND5dHh2JTeUfP0nIcD0g',
    authDomain: 'fightlog-6b57f.firebaseapp.com',
    projectId: 'fightlog-6b57f',
    storageBucket: 'fightlog-6b57f.firebasestorage.app',
    messagingSenderId: '1079218883145',
    appId: '1:1079218883145:web:7da23db630c3fc44b3cd98'
};

export const FIREBASE_VERSION = '10.14.1';

/* Baza nazwana, nie '(default)'. Bez podania id SDK poszedłby do bazy
   domyślnej, której w tym projekcie nie ma. */
export const FIRESTORE_DATABASE_ID = 'fightlog';

export function isConfigured() {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

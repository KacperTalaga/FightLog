/* Konfiguracja projektu Firebase.

   apiKey w konfiguracji webowej Firebase JEST PUBLICZNY z założenia — trafia
   do przeglądarki każdego użytkownika i nie da się go ukryć. Bezpieczeństwo
   zapewniają reguły w firestore.rules, które przepuszczają wyłącznie zapisy
   do users/{uid} właściciela sesji. Nie kombinuj z chowaniem tego klucza.

   Puste pola = tryb wyłącznie lokalny: aplikacja działa w całości na
   localStorage i nie pobiera niczego z CDN. */

export const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};

export const FIREBASE_VERSION = '10.14.1';

export function isConfigured() {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

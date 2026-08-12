# FightLog

PWA do logowania treningów siłowych i sportów walki. Vanilla JS, bez frameworka,
bez bundlera, bez kroku build — Cloudflare Pages serwuje pliki statyczne as-is.

## Uruchomienie lokalne

Aplikacja korzysta z modułów ES, więc **otwarcie `index.html` podwójnym
kliknięciem nie zadziała** (`file://` blokuje importy). Potrzebny jest serwer:

```bash
python -m http.server 8000
```

Potem http://localhost:8000. Używaj `localhost`, a nie `127.0.0.1` — Firebase ma
na liście dozwolonych domen tylko ten pierwszy adres.

## Testy

```bash
node tests/check.mjs
```

Czysty Node, bez zależności i bez przeglądarki. Pilnuje niezmienników, które
łatwo zepsuć: wzór Epleya, klucze dat wobec stref czasowych, reguły progresji,
średnią kroczącą wagi oraz **kompletność listy plików w `sw.js`** — plik dodany
do `js/` lub `css/` i pominięty w szkielecie wywali aplikację offline.

## Struktura

```
index.html
css/     tokens.css (design system) · base.css · components.css · log.css
js/      app.js · store.js · sync.js · progression.js · timer.js · utils.js · toast.js
         data/     plan.js (seed planu) · session.js (fabryki sesji)
         firebase/ config.js
         views/    plan.js · log.js · progress.js · diet.js · knowledge.js
icons/   icon-192.png · icon-512.png · apple-touch-icon.png
tools/   make-icons.mjs
tests/   check.mjs
manifest.json · sw.js · firestore.rules
```

`store.js` to jedyne miejsce dotykające `localStorage`. `sync.js` rejestruje się
w nim jako backend zdalny po zalogowaniu — widoki nie wiedzą o istnieniu Firebase.

## Firebase — konfiguracja

Aplikacja **działa w pełni bez logowania**, na samym `localStorage`. Logowanie
włącza wyłącznie synchronizację telefon ↔ komputer.

1. [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. **Build → Firestore Database → Create database** → **Firestore in Native Mode**
   (nie „with MongoDB compatibility" — ten wariant nie ma Security Rules i nie
   rozmawia z webowym SDK; wyboru nie da się później zmienić), tryb produkcyjny,
   region `eur3` (europe-west).

   Jeśli baza nie nazywa się `(default)`, wpisz jej nazwę w
   `FIRESTORE_DATABASE_ID` w [`js/firebase/config.js`](js/firebase/config.js).
3. **Build → Authentication → Get started → Sign-in method → Google → Enable**.
   Ustaw e-mail wsparcia i zapisz.
4. **Project settings → Your apps → Web (`</>`)** → zarejestruj aplikację.
   Skopiuj obiekt `firebaseConfig` i wklej jego pola do
   [`js/firebase/config.js`](js/firebase/config.js).
5. **Authentication → Settings → Authorized domains** → dodaj `fightlog.pages.dev`
   oraz docelową własną domenę. `localhost` i `127.0.0.1` są tam domyślnie.
6. **Firestore → Rules** → wklej zawartość [`firestore.rules`](firestore.rules)
   i opublikuj. Nie zostawiaj bazy w trybie testowym.

### O kluczu `apiKey`

`apiKey` w konfiguracji webowej Firebase **jest publiczny z założenia** — trafia
do przeglądarki każdego użytkownika i nie da się go ukryć. To identyfikator
projektu, nie sekret. Za bezpieczeństwo odpowiadają reguły z `firestore.rules`,
które przepuszczają odczyt i zapis wyłącznie do `users/{uid}` właściciela sesji.

### Struktura danych w Firestore

```
users/{uid}                    → displayName, email, height, targetWeight, macros
users/{uid}/sessions/{id}      → sesja siłowa albo combat
users/{uid}/weights/{YYYY-MM-DD}
users/{uid}/plan/current       → { version, days }
```

Konflikt rozstrzygany jest po `updatedAt` — last-write-wins. Aplikacja jest
jednoosobowa, więc nie ma tu CRDT.

### Logowanie na iOS

W trybie standalone (aplikacja dodana na ekran główny) `signInWithPopup` bywa
zawodny, dlatego wykrywamy standalone i przechodzimy na `signInWithRedirect`.
Jeśli Safari zablokuje również redirect (ITP), aplikacja pokazuje komunikat na
dole ekranu zamiast cichego błędu w konsoli.

## PWA

### Instalacja na iPhonie

Safari → otwórz `fightlog.pages.dev` → przycisk udostępniania → **Dodaj do ekranu
głównego**. Aplikacja startuje wtedy bez paska Safari i działa w trybie samolotowym.

### Wersjonowanie cache'a — ważne przy każdym wdrożeniu

`sw.js` serwuje szkielet aplikacji strategią **cache-first**. Oznacza to, że po
wdrożeniu zmian przeglądarka będzie pokazywała starą wersję, dopóki nie zmieni
się nazwa cache'a. **Przy każdym wdrożeniu podnieś `CACHE_NAME`** w `sw.js`:

```js
const CACHE_NAME = 'fightlog-v2';   // było v1
```

Stare cache są kasowane w zdarzeniu `activate`. Gdy nowa wersja jest gotowa,
aplikacja pokazuje toast „Nowa wersja — dotknij, żeby odświeżyć"; podmiana
workera następuje dopiero po dotknięciu, żeby nie przerwać zapisywania serii.

Ruch do API Firebase (`firestore.googleapis.com`, `identitytoolkit.googleapis.com`
i pokrewne) **omija service workera w całości** — Firestore ma własną warstwę
offline i podwójne buforowanie zrywałoby sesje.

### Ikony

Ikony są generowane proceduralnie, bez plików graficznych z zewnątrz:

```bash
node tools/make-icons.mjs
```

Znak (litera F) mieści się w środkowym 56% płótna, czyli w bezpiecznym obszarze
ikony `maskable`, więc ten sam plik obsługuje oba warianty.

## Wskaźnik synchronizacji

Kropka przy przycisku konta w nagłówku:

| Kolor | Znaczenie |
|---|---|
| szary | tryb lokalny (bez logowania) |
| zielony | zsynchronizowane |
| pomarańczowy | zapis oczekuje na wysłanie |
| przygaszony | offline, zmiany w kolejce |
| czerwony | błąd synchronizacji |

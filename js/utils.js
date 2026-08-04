/* Drobne narzędzia współdzielone przez wszystkie moduły. */

export function $(selector, root = document) {
    return root.querySelector(selector);
}

export function $$(selector, root = document) {
    return [...root.querySelectorAll(selector)];
}

/* Klucz dnia YYYY-MM-DD budowany z lokalnych składowych daty.
   toISOString() konwertuje do UTC, więc wpis o 23:50 czasu polskiego
   wylądowałby pod datą następnego dnia. */
export function dateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/* Odwrotność dateKey. new Date('2026-08-04') parsuje się jako UTC i w naszej
   strefie wypada 4 sierpnia o 2:00 — przy porównaniach dni to wystarczy, żeby
   pomylić się o dobę, więc składamy datę lokalnie. */
export function parseDateKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/* Indeks dnia w tablicy PLAN, która zaczyna się od poniedziałku.
   getDay() zwraca 0 dla niedzieli, stąd przesunięcie o 6. */
export function planDayIndex(date = new Date()) {
    return (date.getDay() + 6) % 7;
}

/* '72,5' → 72.5, puste → null. Przecinek, bo klawiatura numeryczna na iOS
   podsuwa separator lokalny, a do 1RM potrzebujemy liczby, nie stringa. */
export function parseNumber(value) {
    const normalized = String(value).replace(',', '.').trim();
    if (normalized === '') return null;

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

/* Ucieczka znaków przed wstawieniem tekstu do szablonu HTML.
   Notatki i nazwy ćwiczeń są edytowalne przez użytkownika, więc nie mogą
   trafiać do innerHTML surowe. */
export function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

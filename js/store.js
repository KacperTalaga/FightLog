/* Warstwa danych na localStorage.

   Cała reszta aplikacji korzysta wyłącznie z tych funkcji i nigdy nie sięga
   do localStorage bezpośrednio — dzięki temu etap z Firestore podmienia
   jeden plik, a nie dwadzieścia miejsc w widokach.

   Układ kluczy odwzorowuje docelową strukturę Firestore:
     fightlog:sessions  → users/{uid}/sessions
     fightlog:weights   → users/{uid}/weights
     fightlog:plan      → users/{uid}/plan/current
     fightlog:settings  → users/{uid} */

import { PLAN, PLAN_VERSION } from './data/plan.js';

const KEYS = {
    sessions: 'fightlog:sessions',
    weights: 'fightlog:weights',
    plan: 'fightlog:plan',
    settings: 'fightlog:settings'
};

export const DEFAULT_SETTINGS = {
    height: 183,
    targetWeight: 75,
    macros: { kcal: 2650, protein: 170, carbs: 310, fat: 75 },
    restTimerSec: 90,
    /* Tydzień, w którym ostatnio sprawdzano rotację ćwiczeń, i jej wynik. */
    rotationWeek: null,
    rotation: null
};

/* Uszkodzony wpis (ręczna edycja, przerwany zapis) nie może wywalić startu
   aplikacji — wtedy lepiej wystartować pusto niż nie wystartować wcale. */
function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        console.warn(`FightLog: nie udało się odczytać ${key}`, error);
        return fallback;
    }
}

function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- Podpięcie zdalnego backendu ---------- */

/* Firestore rejestruje się tu po zalogowaniu. Dopóki remote jest null,
   aplikacja działa wyłącznie lokalnie — i musi działać w pełni. */
let remote = null;
const changeListeners = new Set();

export function setRemote(handler) {
    remote = handler;
}

export function onChange(listener) {
    changeListeners.add(listener);
}

/* Powiadamiamy tylko o zmianach przychodzących z zewnątrz. Zapis lokalny
   pochodzi z akcji użytkownika, a przerysowanie widoku w trakcie pisania
   zabrałoby fokus z inputa. */
function notifyChange() {
    changeListeners.forEach(listener => listener());
}

/* Konflikt rozstrzygamy po updatedAt (last-write-wins). Aplikacja jest
   jednoosobowa — CRDT byłby tu przerostem formy nad treścią. */
function isNewer(incoming, existing) {
    return !existing || (incoming.updatedAt ?? 0) > (existing.updatedAt ?? 0);
}

/* ---------- Sesje ---------- */

/* Sesje trzymamy jako mapę id → sesja, żeby zapis pojedynczej sesji
   nie wymagał przeszukiwania tablicy. */
function readSessionMap() {
    return read(KEYS.sessions, {});
}

export function getSessions() {
    return Object.values(readSessionMap()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getSession(id) {
    return readSessionMap()[id] ?? null;
}

export function getSessionIds() {
    return Object.keys(readSessionMap());
}

export function saveSession(session) {
    const sessions = readSessionMap();
    sessions[session.id] = { ...session, updatedAt: Date.now() };
    write(KEYS.sessions, sessions);

    remote?.saveSession(sessions[session.id]);
    return sessions[session.id];
}

export function deleteSession(id) {
    const sessions = readSessionMap();
    delete sessions[id];
    write(KEYS.sessions, sessions);

    remote?.deleteSession(id);
}

/* ---------- Sesje przychodzące z Firestore ---------- */

export function applyRemoteSession(session) {
    const sessions = readSessionMap();
    if (!isNewer(session, sessions[session.id])) return;

    sessions[session.id] = session;
    write(KEYS.sessions, sessions);
    notifyChange();
}

export function applyRemoteSessionRemoval(id) {
    const sessions = readSessionMap();
    if (!(id in sessions)) return;

    delete sessions[id];
    write(KEYS.sessions, sessions);
    notifyChange();
}

/* ---------- Waga ---------- */

function readWeightMap() {
    return read(KEYS.weights, {});
}

export function getWeights() {
    return Object.values(readWeightMap()).sort((a, b) => a.date.localeCompare(b.date));
}

/* Jeden wpis na dzień, nadpisywalny — stąd data jako id dokumentu. */
export function saveWeight(date, weight) {
    const weights = readWeightMap();
    weights[date] = {
        id: date,
        date,
        weight,
        createdAt: weights[date]?.createdAt ?? Date.now(),
        updatedAt: Date.now()
    };
    write(KEYS.weights, weights);

    remote?.saveWeight(weights[date]);
    return weights[date];
}

export function applyRemoteWeight(entry) {
    const weights = readWeightMap();
    if (!isNewer(entry, weights[entry.id])) return;

    weights[entry.id] = entry;
    write(KEYS.weights, weights);
    notifyChange();
}

export function getLatestWeight() {
    const weights = getWeights();
    return weights.length ? weights.at(-1).weight : null;
}

/* ---------- Plan ---------- */

/* Plan z seeda wgrywamy przy pierwszym uruchomieniu i przy podbiciu
   PLAN_VERSION w kodzie — inaczej nowe ćwiczenia nigdy by nie dotarły
   do użytkownika, który raz odpalił aplikację. */
/* seedVersion śledzi wersję danych z repo, version rośnie przy każdej edycji
   planu (rotacja ćwiczeń). Bez tego rozdzielenia rotacje wywindowałyby version
   ponad PLAN_VERSION i nowa treść planu z kodu nigdy by nie dotarła. */
export function getPlan() {
    const stored = read(KEYS.plan, null);
    if (stored?.days && (stored.seedVersion ?? stored.version ?? 0) >= PLAN_VERSION) return stored;

    const seeded = {
        version: (stored?.version ?? 0) + 1,
        seedVersion: PLAN_VERSION,
        days: PLAN,
        updatedAt: Date.now()
    };
    write(KEYS.plan, seeded);
    return seeded;
}

export function savePlan(days) {
    const current = getPlan();
    const updated = {
        version: current.version + 1,
        seedVersion: current.seedVersion ?? PLAN_VERSION,
        days,
        updatedAt: Date.now()
    };
    write(KEYS.plan, updated);

    remote?.savePlan(updated);
    return updated;
}

export function applyRemotePlan(plan) {
    if (!plan?.days || !isNewer(plan, getPlan())) return;

    write(KEYS.plan, plan);
    notifyChange();
}

/* ---------- Ustawienia ---------- */

export function getSettings() {
    const stored = read(KEYS.settings, {});
    return { ...DEFAULT_SETTINGS, ...stored, macros: { ...DEFAULT_SETTINGS.macros, ...stored.macros } };
}

export function saveSettings(patch) {
    const updated = { ...getSettings(), ...patch, updatedAt: Date.now() };
    write(KEYS.settings, updated);

    remote?.saveSettings(updated);
    return updated;
}

export function applyRemoteSettings(settings) {
    if (!settings || !isNewer(settings, getSettings())) return;

    write(KEYS.settings, { ...getSettings(), ...settings });
    notifyChange();
}

/* ---------- Eksport / czyszczenie ---------- */

export function exportAll() {
    return {
        exportedAt: new Date().toISOString(),
        sessions: readSessionMap(),
        weights: readWeightMap(),
        plan: getPlan(),
        settings: getSettings()
    };
}

export function clearAll() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

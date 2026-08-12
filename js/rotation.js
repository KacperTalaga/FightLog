/* Samodzielna rotacja ćwiczeń.

   Reguły są wprost z sekcji „Kiedy zmieniać ćwiczenia” w bazie wiedzy:
     • stagnacja mimo deloadu  → zmień wariant
     • 8–12 tygodni bez zmiany → rotacja na wariant tego samego wzorca
   Trzecia przesłanka z bazy — ból i kolizja z treningiem walki — zostaje po
   twojej stronie, bo aplikacja nie ma jak jej wykryć.

   Zamiana zawsze zostaje w obrębie wzorca ruchowego, więc struktura treningu
   się nie zmienia. Rotacja odpala się raz na tydzień treningowy i ma limit
   zmian — przebudowa całego planu naraz zabrałaby punkt odniesienia
   we wszystkich ćwiczeniach jednocześnie. */

import { patternOf, variantsOfPattern } from './data/variants.js';
import { suggestNext } from './progression.js';
import { getPlan, savePlan, getSessions, getSettings, saveSettings } from './store.js';
import { dateKey, parseDateKey, weekStartKey } from './utils.js';

/* Środek zakresu 8–12 tygodni z bazy wiedzy. */
export const ROTATE_AFTER_WEEKS = 10;

/* Przy deloadzie co 5 tygodni tyle wystarczy, żeby po drodze wypadł co najmniej
   jeden — czyli „stagnacja mimo deloadu”, a nie „stagnacja od dwóch sesji”. */
export const STAGNATION_MIN_WEEKS = 5;

export const MAX_CHANGES_PER_WEEK = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

function sessionsWith(exerciseId, sessions) {
    return sessions
        .filter(session => session.exercises?.some(entry => entry.id === exerciseId))
        .map(session => session.date)
        .sort();
}

/* Tygodnie na ćwiczeniu liczone od pierwszej sesji, w której się pojawiło.
   Ćwiczenie nigdy nietrenowane nie rotuje — nie da się powiedzieć, że coś
   przestało działać, jeśli nie zostało wykonane ani razu. */
export function weeksOnExercise(exerciseId, sessions, today = new Date()) {
    const dates = sessionsWith(exerciseId, sessions);
    if (!dates.length) return 0;

    const days = Math.floor((today - parseDateKey(dates[0])) / DAY_MS);
    return Math.floor(Math.max(days, 0) / 7) + 1;
}

function lastUsed(exerciseId, sessions) {
    const dates = sessionsWith(exerciseId, sessions);
    return dates.length ? dates.at(-1) : null;
}

/* Wybieramy wariant najdawniej używany, a najchętniej taki, którego nie było
   nigdy — inaczej rotacja krążyłaby między dwoma tymi samymi ćwiczeniami. */
function pickReplacement(pattern, currentId, taken, sessions) {
    const candidates = variantsOfPattern(pattern)
        .filter(variant => variant.id !== currentId && !taken.has(variant.id) && !variant.legacy);

    if (!candidates.length) return null;

    return candidates
        .map(variant => ({ variant, used: lastUsed(variant.id, sessions) }))
        .sort((a, b) => {
            if (a.used === b.used) return 0;
            if (a.used === null) return -1;
            if (b.used === null) return 1;
            return a.used.localeCompare(b.used);
        })[0].variant;
}

/**
 * Ocenia plan i zwraca listę zamian do wykonania.
 * @returns {{dayKey, from, to, reason, weeks}[]}
 */
export function evaluateRotation(plan, sessions, options = {}) {
    const { today = new Date(), limit = MAX_CHANGES_PER_WEEK } = options;
    const proposals = [];

    /* Ćwiczenia już obecne w planie są zajęte — nie chcemy dubla w jednym dniu
       ani tego samego ruchu dwa razy w tygodniu. */
    const taken = new Set(plan.days.flatMap(day => day.exercises.map(item => item.id)));

    for (const day of plan.days) {
        for (const exercise of day.exercises) {
            const pattern = patternOf(exercise.id);
            if (!pattern) continue;              // ćwiczenie spoza katalogu zostawiamy w spokoju

            const weeks = weeksOnExercise(exercise.id, sessions, today);
            if (!weeks) continue;

            const { stagnant } = suggestNext(exercise, sessions, { today });
            const reason = stagnant && weeks >= STAGNATION_MIN_WEEKS ? 'stagnacja'
                : weeks >= ROTATE_AFTER_WEEKS ? 'rotacja'
                : null;

            if (!reason) continue;

            const replacement = pickReplacement(pattern, exercise.id, taken, sessions);
            if (!replacement) continue;

            taken.add(replacement.id);
            proposals.push({ dayKey: day.key, from: exercise, to: replacement, reason, weeks });
        }
    }

    /* Stagnacja przed rutynową rotacją, a przy równym stopniu — dłużej trwające
       ćwiczenie pierwsze. */
    return proposals
        .sort((a, b) => (a.reason === b.reason ? b.weeks - a.weeks : a.reason === 'stagnacja' ? -1 : 1))
        .slice(0, limit);
}

/* Zwraca nową tablicę dni z podmienionymi ćwiczeniami. Plan nie jest mutowany —
   stara wersja musi przetrwać, żeby dało się cofnąć zamianę. */
export function applyRotation(days, proposals, today = new Date()) {
    const byDay = new Map();
    proposals.forEach(proposal => {
        if (!byDay.has(proposal.dayKey)) byDay.set(proposal.dayKey, new Map());
        byDay.get(proposal.dayKey).set(proposal.from.id, proposal.to);
    });

    return days.map(day => {
        const swaps = byDay.get(day.key);
        if (!swaps) return day;

        return {
            ...day,
            exercises: day.exercises.map(exercise => {
                const replacement = swaps.get(exercise.id);
                return replacement ? { ...replacement, since: dateKey(today) } : exercise;
            })
        };
    });
}

/* Cofnięcie: wstawiamy z powrotem dokładnie te obiekty, które były wcześniej. */
export function revertRotation(days, changes) {
    const byDay = new Map();
    changes.forEach(change => {
        if (!byDay.has(change.dayKey)) byDay.set(change.dayKey, new Map());
        byDay.get(change.dayKey).set(change.to.id, change.from);
    });

    return days.map(day => {
        const swaps = byDay.get(day.key);
        if (!swaps) return day;

        return {
            ...day,
            exercises: day.exercises.map(exercise => swaps.get(exercise.id) ?? exercise)
        };
    });
}

export function currentRotationWeek(today = new Date()) {
    return weekStartKey(dateKey(today));
}

/* ---------- Uruchomienie ---------- */

/**
 * Sprawdza plan raz na tydzień treningowy i stosuje zamiany.
 * Wywoływane przy starcie aplikacji.
 * @returns lista zastosowanych zamian albo null
 */
export function runWeeklyRotation(options = {}) {
    const { today = new Date() } = options;
    const week = currentRotationWeek(today);

    /* Raz na tydzień — inaczej każde otwarcie aplikacji mogłoby przestawiać
       plan, a w środę zastałbyś inny trening niż w poniedziałek. */
    if (getSettings().rotationWeek === week) return null;

    const plan = getPlan();
    const proposals = evaluateRotation(plan, getSessions(), { today });

    if (!proposals.length) {
        saveSettings({ rotationWeek: week });
        return null;
    }

    savePlan(applyRotation(plan.days, proposals, today));
    saveSettings({ rotationWeek: week, rotation: { week, changes: proposals } });
    return proposals;
}

export function lastRotation() {
    return getSettings().rotation;
}

export function undoLastRotation() {
    const rotation = getSettings().rotation;
    if (!rotation?.changes?.length) return false;

    savePlan(revertRotation(getPlan().days, rotation.changes));
    saveSettings({ rotation: null });
    return true;
}

export function dismissRotation() {
    saveSettings({ rotation: null });
}

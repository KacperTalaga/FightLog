/* Statystyki liczone z historii sesji — funkcje czyste, bez dotykania storage.

   Wszystko opiera się o serie faktycznie wykonane (done + wpisane powtórzenia).
   Serie zaplanowane, ale nierobione, nie mogą podnosić objętości ani rekordów. */

import { dateKey, weekStartKey } from './utils.js';
import { musclesFor } from './data/muscles.js';

/* Wzór Epleya. Kontrola: 70 kg × 8 → 88.7 kg. */
export function epley1RM(weight, reps) {
    if (weight == null || reps == null || reps <= 0) return null;
    return weight * (1 + reps / 30);
}

function round1(value) {
    return Math.round(value * 10) / 10;
}

function performedSets(entry) {
    return entry.sets.filter(set => set.done && set.reps != null);
}

export function strengthSessions(sessions) {
    return sessions
        .filter(session => session.type === 'strength' && Array.isArray(session.exercises))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/* Klucz wariantu: ćwiczenie plus sprzęt. Ten sam ruch na innej maszynie ma
   inną skalę obciążenia, więc na wykresach i w rekordach żyje osobno. */
export function variantKey(exerciseId, machine) {
    return `${exerciseId}::${machine ?? ''}`;
}

function variantLabel(name, machine) {
    return machine ? `${name} — ${machine}` : name;
}

/* Warianty, dla których jest co pokazać na wykresie. */
export function exercisesWithHistory(sessions) {
    const found = new Map();

    for (const session of strengthSessions(sessions)) {
        for (const entry of session.exercises) {
            if (!performedSets(entry).length) continue;

            const machine = entry.machine ?? null;
            found.set(variantKey(entry.id, machine), {
                key: variantKey(entry.id, machine),
                id: entry.id,
                machine,
                name: entry.name,
                label: variantLabel(entry.name, machine)
            });
        }
    }
    return [...found.values()].sort((a, b) => a.label.localeCompare(b.label, 'pl'));
}

/* ---------- Wykres 1RM ---------- */

/* Najlepsza seria sesji wg estymowanego 1RM — nie najcięższa i nie ostatnia,
   bo 60 kg × 12 bywa lepszym wynikiem niż 80 kg × 3. */
export function bestE1RMOf(entry) {
    const values = performedSets(entry)
        .map(set => epley1RM(set.weight, set.reps))
        .filter(value => value != null);

    return values.length ? Math.max(...values) : null;
}

export function oneRepMaxSeries(exerciseId, sessions, machine = null) {
    const points = [];

    for (const session of strengthSessions(sessions)) {
        const entry = session.exercises.find(item => item.id === exerciseId);
        if (!entry || (entry.machine ?? null) !== machine) continue;

        const best = bestE1RMOf(entry);
        if (best != null) points.push({ label: session.date, value: round1(best) });
    }
    return points;
}

/* Najlepszy dotychczasowy 1RM — do oznaczania nowego rekordu w logu. */
export function bestE1RM(exerciseId, sessions, machine = null) {
    const values = oneRepMaxSeries(exerciseId, sessions, machine).map(point => point.value);
    return values.length ? Math.max(...values) : 0;
}

/* Oznaczenie rekordu dla kolejnych serii jednego ćwiczenia w sesji.

   Rekord musi bić wszystko, co było wcześniej — również wcześniejsze serie tego
   samego treningu, stąd bieżące maksimum przesuwane w trakcie przebiegu.
   Porównywanie każdej serii wyłącznie do wyniku sprzed sesji dawało „PR” przy
   każdej kolejnej serii, nawet gdy była słabsza od pierwszej.

   Bez wcześniejszej historii nie ma czego bić, więc pierwsze serie w życiu
   rekordami nie są. */
export function markRecords(sets, previousBest = 0) {
    let best = previousBest;
    const hasHistory = previousBest > 0;

    return sets.map(set => {
        const estimated = set.done ? epley1RM(set.weight, set.reps) : null;
        const isRecord = hasHistory && estimated != null && estimated > best;

        if (estimated != null) best = Math.max(best, estimated);
        return { isRecord, estimated };
    });
}

/* ---------- Objętość ---------- */

/* Objętość serii: ciężar × powtórzenia, razem z dropsetem — dropset to
   wykonana praca, nie przypis. */
export function volumeOfSet(set) {
    if (!set.done || set.reps == null || set.weight == null) return 0;

    let volume = set.weight * set.reps;
    if (set.dropset?.weight != null && set.dropset?.reps != null) {
        volume += set.dropset.weight * set.dropset.reps;
    }
    return volume;
}

export function volumeOfEntry(entry) {
    return entry.sets.reduce((sum, set) => sum + volumeOfSet(set), 0);
}

/* exerciseId === null → objętość całego treningu. */
export function weeklyVolumeSeries(exerciseId, sessions, machine = null) {
    const byWeek = new Map();

    for (const session of strengthSessions(sessions)) {
        const entries = exerciseId
            ? session.exercises.filter(entry => entry.id === exerciseId && (entry.machine ?? null) === machine)
            : session.exercises;

        const volume = entries.reduce((sum, entry) => sum + volumeOfEntry(entry), 0);
        if (!volume) continue;

        const week = weekStartKey(session.date);
        byWeek.set(week, (byWeek.get(week) ?? 0) + volume);
    }

    return [...byWeek.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, value]) => ({ label, value: Math.round(value) }));
}

/* ---------- Rekordy ---------- */

export function personalRecords(sessions) {
    const best = new Map();

    for (const session of strengthSessions(sessions)) {
        for (const entry of session.exercises) {
            for (const set of performedSets(entry)) {
                const value = epley1RM(set.weight, set.reps);
                if (value == null) continue;

                const machine = entry.machine ?? null;
                const key = variantKey(entry.id, machine);
                const current = best.get(key);
                if (current && value <= current.e1rm) continue;

                best.set(key, {
                    id: entry.id,
                    machine,
                    name: entry.name,
                    label: variantLabel(entry.name, machine),
                    weight: set.weight,
                    reps: set.reps,
                    date: session.date,
                    e1rm: round1(value)
                });
            }
        }
    }

    return [...best.values()].sort((a, b) => b.e1rm - a.e1rm);
}

/* ---------- Objętość per partia ---------- */

/* Zwraca liczbę serii tygodniowo na partię: 1.0 za partię główną,
   0.5 za wspomagającą. */
export function weeklySetsByMuscle(sessions, weekKey) {
    const totals = {};

    for (const session of strengthSessions(sessions)) {
        if (weekStartKey(session.date) !== weekKey) continue;

        for (const entry of session.exercises) {
            const count = performedSets(entry).length;
            if (!count) continue;

            musclesFor(entry.id).forEach((muscle, index) => {
                totals[muscle] = (totals[muscle] ?? 0) + count * (index === 0 ? 1 : 0.5);
            });
        }
    }
    return totals;
}

/* ---------- Kalendarz ---------- */

/* Siatka ostatnich N tygodni, od poniedziałku, z typem sesji w danym dniu. */
export function sessionCalendar(sessions, weeks = 12, today = new Date()) {
    const byDate = new Map(sessions.map(session => [session.date, session.type]));

    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (weeks - 1) * 7);

    const days = [];
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
        const key = dateKey(cursor);
        days.push({ date: key, type: byDate.get(key) ?? null });
    }
    return days;
}

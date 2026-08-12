/* Fabryki sesji treningowych.

   Sety są budowane z planu z góry, wszystkie naraz, z flagą done: false.
   Dokładanie ich przez push w trakcie treningu psuje się, gdy ktoś wykona
   serię poza kolejnością — indeks w DOM przestaje wtedy zgadzać się z danymi. */

import { dateKey } from '../utils.js';
import { baseWeight } from './plan.js';

export const SESSION_TYPES = { STRENGTH: 'strength', COMBAT: 'combat' };

/* Druga sesja tego samego dnia dostaje sufiks _2, trzecia _3 itd. */
export function nextSessionId(date, existingIds = []) {
    if (!existingIds.includes(date)) return date;

    let suffix = 2;
    while (existingIds.includes(`${date}_${suffix}`)) suffix += 1;
    return `${date}_${suffix}`;
}

/* Obciążenie dołożone ponad masę ciała. Rozdzielamy je od ciężaru bezwzględnego,
   bo przy podciąganiu chcesz wpisać „+5”, a nie 80.9 — ale do 1RM i objętości
   i tak potrzebna jest liczba bezwzględna. */
export function addedFrom(absoluteWeight, bodyweightKg) {
    if (absoluteWeight == null || bodyweightKg == null) return null;
    return Math.round((absoluteWeight - bodyweightKg) * 10) / 10;
}

/* Odwrotność: masa ciała + dokładka. Zapisujemy wynik do weight, żeby reszta
   aplikacji nie musiała wiedzieć, że to ćwiczenie z masy ciała. */
export function resolveBodyweight(set, bodyweightKg) {
    set.weight = bodyweightKg == null
        ? null
        : Math.round((bodyweightKg + (set.added ?? 0)) * 10) / 10;
    return set;
}

/* Wartości planowane biorą się z silnika progresji, jeśli został podany.
   Bez niego (albo bez historii) spadamy na ciężar startowy z planu. */
function buildSets(exercise, bodyweightKg, suggest) {
    const suggestion = suggest ? suggest(exercise) : null;
    const plannedWeight = suggestion ? suggestion.weight : baseWeight(exercise, bodyweightKg);
    const plannedReps = suggestion ? suggestion.reps : exercise.repRange[0];
    const plannedAdded = exercise.bodyweight ? addedFrom(plannedWeight, bodyweightKg) : null;

    /* Array.from z funkcją, a nie fill(obiekt) — fill wstawiłby wszędzie
       tę samą referencję i wpisanie ciężaru w serii 1 zmieniłoby wszystkie. */
    return Array.from({ length: exercise.sets }, () => ({
        plannedWeight,
        plannedReps,
        plannedAdded,
        weight: null,
        reps: null,
        added: null,
        dropset: null,
        done: false
    }));
}

export function buildStrengthSession(day, options = {}) {
    const { date = dateKey(), planVersion = 1, bodyweightKg = null, existingIds = [], suggest = null } = options;
    const now = Date.now();

    return {
        id: nextSessionId(date, existingIds),
        date,
        dayKey: day.key,
        type: SESSION_TYPES.STRENGTH,
        planVersion,
        /* Migawka masy ciała z dnia treningu — późniejsza zmiana wagi nie może
           przepisywać wstecz ciężarów w zapisanych sesjach. */
        bodyweightKg,
        note: '',
        createdAt: now,
        updatedAt: now,
        exercises: day.exercises.map(exercise => ({
            id: exercise.id,
            name: exercise.name,
            tag: exercise.tag,
            bodyweight: exercise.bodyweight,
            perSide: exercise.perSide,
            unit: exercise.unit,
            /* Wariant sprzętu. Ten sam ruch na innej maszynie ma inne
               obciążenia, więc historia jest prowadzona osobno. */
            machine: null,
            note: '',
            sets: buildSets(exercise, bodyweightKg, suggest)
        }))
    };
}

export function buildCombatSession(day, options = {}) {
    const { date = dateKey(), existingIds = [] } = options;
    const now = Date.now();

    return {
        id: nextSessionId(date, existingIds),
        date,
        dayKey: day.key,
        type: SESSION_TYPES.COMBAT,
        discipline: day.type.toLowerCase() === 'kickboxing' ? 'kickboxing' : 'boks',
        durationMin: null,
        rating: null,
        note: '',
        createdAt: now,
        updatedAt: now
    };
}

export function buildSessionForDay(day, options = {}) {
    return day.isCombat ? buildCombatSession(day, options) : buildStrengthSession(day, options);
}

/* Pusty set doklejany przyciskiem „Dodaj serię” — ciężar przepisany
   z poprzedniej serii, bo to prawie zawsze ta sama wartość. */
export function buildExtraSet(previousSet) {
    return {
        plannedWeight: previousSet?.plannedWeight ?? null,
        plannedReps: previousSet?.plannedReps ?? null,
        plannedAdded: previousSet?.plannedAdded ?? null,
        weight: null,
        reps: null,
        added: null,
        dropset: null,
        done: false
    };
}

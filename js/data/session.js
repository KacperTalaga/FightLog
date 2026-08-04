/* Fabryki sesji treningowych.

   Sety są budowane z planu z góry, wszystkie naraz, z flagą done: false.
   Dokładanie ich przez push w trakcie treningu psuje się, gdy ktoś wykona
   serię poza kolejnością — indeks w DOM przestaje wtedy zgadzać się z danymi. */

import { dateKey } from '../utils.js';

export const SESSION_TYPES = { STRENGTH: 'strength', COMBAT: 'combat' };

/* Druga sesja tego samego dnia dostaje sufiks _2, trzecia _3 itd. */
export function nextSessionId(date, existingIds = []) {
    if (!existingIds.includes(date)) return date;

    let suffix = 2;
    while (existingIds.includes(`${date}_${suffix}`)) suffix += 1;
    return `${date}_${suffix}`;
}

/* Ciężar startowy do wyświetlenia w logu. Przy ćwiczeniach z masy ciała
   zapisujemy realną liczbę (masa ciała + ewentualne obciążenie), bo pola
   weight/reps trafiają potem do wzoru na 1RM i muszą być liczbami. */
function plannedWeightFor(exercise, bodyweightKg) {
    if (!exercise.bodyweight) return exercise.startWeight;
    if (bodyweightKg == null) return null;
    return Math.round((bodyweightKg + (exercise.startWeight ?? 0)) * 10) / 10;
}

function buildSets(exercise, bodyweightKg) {
    const plannedWeight = plannedWeightFor(exercise, bodyweightKg);
    const plannedReps = exercise.repRange[0];

    /* Array.from z funkcją, a nie fill(obiekt) — fill wstawiłby wszędzie
       tę samą referencję i wpisanie ciężaru w serii 1 zmieniłoby wszystkie. */
    return Array.from({ length: exercise.sets }, () => ({
        plannedWeight,
        plannedReps,
        weight: null,
        reps: null,
        dropset: null,
        done: false
    }));
}

export function buildStrengthSession(day, options = {}) {
    const { date = dateKey(), planVersion = 1, bodyweightKg = null, existingIds = [] } = options;
    const now = Date.now();

    return {
        id: nextSessionId(date, existingIds),
        date,
        dayKey: day.key,
        type: SESSION_TYPES.STRENGTH,
        planVersion,
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
            note: '',
            sets: buildSets(exercise, bodyweightKg)
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
        weight: null,
        reps: null,
        dropset: null,
        done: false
    };
}

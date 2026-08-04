/* Silnik progresji — double progression.

   Zasada: najpierw rośnie liczba powtórzeń w zakresie repRange, a dopiero gdy
   wszystkie serie trafią w górną granicę, rośnie ciężar i powtórzenia wracają
   na dół zakresu. Dzięki temu ciężar idzie w górę tylko wtedy, gdy naprawdę
   zamknąłeś cały zakres, a nie po jednej udanej serii.

   Funkcje są czyste — dostają historię jako argument, same nie czytają storage.
   To pozwala je przetestować i użyć zarówno w widoku PLAN, jak i w logu. */

import { baseWeight } from './data/plan.js';
import { parseDateKey } from './utils.js';

export const DELOAD_EVERY_WEEKS = 5;
export const DELOAD_FACTOR = 0.55;
export const STAGNATION_SESSIONS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/* Serie faktycznie wykonane. Set bez powtórzeń nic nie mówi o progresji,
   nawet jeśli został odhaczony. */
function performedSets(entry) {
    return entry.sets.filter(set => set.done && set.reps != null);
}

function topWeight(sets) {
    const weights = sets.map(set => set.weight).filter(weight => weight != null);
    return weights.length ? Math.max(...weights) : null;
}

/* Najlepszy wynik powtórzeń na ciężarze roboczym — po nim celujemy o jedno
   powtórzenie wyżej. */
function bestReps(sets, weight) {
    const relevant = weight == null ? sets : sets.filter(set => set.weight === weight);
    return Math.max(...relevant.map(set => set.reps));
}

function roundToStep(value, step) {
    if (value == null) return null;
    return Math.round(Math.round(value / step) * step * 10) / 10;
}

/* Historia ćwiczenia: sesje siłowe, w których choć jedna seria została
   wykonana, od najstarszej do najnowszej. */
export function exerciseHistory(exerciseId, sessions) {
    return sessions
        .filter(session => session.type === 'strength' && Array.isArray(session.exercises))
        .map(session => {
            const entry = session.exercises.find(item => item.id === exerciseId);
            return entry ? { date: session.date, sets: performedSets(entry), total: entry.sets.length } : null;
        })
        .filter(item => item && item.sets.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date));
}

/* Tydzień treningowy liczony od pierwszej zapisanej sesji, numerowany od 1. */
export function trainingWeek(sessions, today = new Date()) {
    const dates = sessions.map(session => session.date).sort();
    if (!dates.length) return 1;

    const days = Math.floor((today - parseDateKey(dates[0])) / DAY_MS);
    return Math.floor(Math.max(days, 0) / 7) + 1;
}

export function isDeloadWeek(sessions, today = new Date()) {
    return trainingWeek(sessions, today) % DELOAD_EVERY_WEEKS === 0;
}

/* Trzy sesje z rzędu na tym samym ciężarze roboczym = ciało się nie rusza. */
function isStagnant(history) {
    if (history.length < STAGNATION_SESSIONS) return false;

    const recent = history.slice(-STAGNATION_SESSIONS).map(item => topWeight(item.sets));
    return recent.every(weight => weight != null && weight === recent[0]);
}

/**
 * Sugestia na najbliższą sesję.
 * @returns {{weight: number|null, reps: number, source: string, stagnant: boolean,
 *            deload: boolean, last: {weight: number|null, reps: number, date: string}|null}}
 */
export function suggestNext(exercise, sessions, options = {}) {
    const { bodyweightKg = null, today = new Date() } = options;
    const [minReps, maxReps] = exercise.repRange;
    const history = exerciseHistory(exercise.id, sessions);
    const deload = isDeloadWeek(sessions, today);

    const result = {
        weight: null,
        reps: minReps,
        source: 'plan',
        stagnant: isStagnant(history),
        deload,
        last: null
    };

    if (!history.length) {
        result.weight = baseWeight(exercise, bodyweightKg);
    } else {
        const previous = history.at(-1);
        const workingWeight = topWeight(previous.sets);
        const previousBest = bestReps(previous.sets, workingWeight);

        result.last = { weight: workingWeight, reps: previousBest, date: previous.date };

        /* Ciężar rośnie tylko gdy wszystkie zaplanowane serie zostały wykonane
           i każda trafiła w górną granicę zakresu. Trzy udane serie z czterech
           to jeszcze nie zamknięty zakres. */
        const closedRange = previous.sets.length >= previous.total
            && previous.sets.every(set => set.reps >= maxReps);

        if (closedRange) {
            result.weight = workingWeight == null ? null : roundToStep(workingWeight + exercise.increment, 0.5);
            result.reps = minReps;
            result.source = 'progress';
        } else {
            result.weight = workingWeight;
            result.reps = Math.min(previousBest + 1, maxReps);
            result.source = 'hold';
        }
    }

    if (deload && result.weight != null) {
        /* Masy własnego ciała nie da się zdjąć na deloadzie — obcinamy tylko
           obciążenie dołożone ponad nią, inaczej sugestia wyszłaby poniżej
           tego, co i tak podnosisz przy każdym podciągnięciu. */
        if (exercise.bodyweight && bodyweightKg != null) {
            const added = Math.max(result.weight - bodyweightKg, 0);
            result.weight = Math.round((bodyweightKg + added * DELOAD_FACTOR) * 10) / 10;
        } else {
            result.weight = roundToStep(result.weight * DELOAD_FACTOR, exercise.increment);
        }
        result.reps = minReps;
        result.source = 'deload';
    }

    return result;
}

/* „70 kg × 8” albo „8 powt.” gdy ciężar nie był notowany (maszyna, stos). */
export function formatLast(last) {
    if (!last) return null;
    return last.weight == null ? `${last.reps} powt.` : `${last.weight} kg × ${last.reps}`;
}

/* „72.5 kg × 6”, „BW +5 kg × 8”, „dobierz × 12”, „10 sek / str”.
   Przy masie ciała pokazujemy samo dołożone obciążenie — „79 kg × 8”
   przy podciąganiu byłoby mylące. */
export function formatSuggestion(suggestion, exercise, bodyweightKg = null) {
    const reps = exercise.unit === 'sek' ? `${suggestion.reps} sek` : `${suggestion.reps}`;

    /* Bez wpisu wagi ciała nie znamy liczby bezwzględnej — wtedy pokazujemy
       samo obciążenie z planu zamiast bezużytecznego „dobierz”. */
    if (exercise.bodyweight) {
        const added = suggestion.weight != null && bodyweightKg != null
            ? Math.round((suggestion.weight - bodyweightKg) * 10) / 10
            : (exercise.startWeight ?? 0);
        return added > 0 ? `BW +${added} kg × ${reps}` : `BW × ${reps}`;
    }

    if (suggestion.weight == null) return `dobierz × ${reps}`;
    return `${suggestion.weight} kg × ${reps}`;
}

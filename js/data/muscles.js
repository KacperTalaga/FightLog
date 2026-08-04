/* Mapowanie ćwiczenie → partie mięśniowe, do liczenia objętości tygodniowej.

   Seria liczy się 1.0 dla partii głównej i 0.5 dla wspomagającej — tak liczy
   się objętość w literaturze treningowej i tak wychodzą sensowne liczby przy
   celu 10–20 serii tygodniowo na partię. */

export const MUSCLE_LABELS = {
    klatka: 'Klatka',
    plecy: 'Plecy',
    barki: 'Barki',
    biceps: 'Biceps',
    triceps: 'Triceps',
    nogi: 'Nogi',
    brzuch: 'Brzuch'
};

export const WEEKLY_SETS_TARGET = { min: 10, max: 20 };

/* [partia główna, ...partie wspomagające] */
const MUSCLES = {
    pullup: ['plecy', 'biceps'],
    pullup2: ['plecy', 'biceps'],
    'db-row': ['plecy', 'biceps'],
    'face-pull': ['barki', 'plecy'],
    'rear-delt': ['barki'],

    bench: ['klatka', 'triceps', 'barki'],
    'incline-db': ['klatka', 'triceps', 'barki'],
    'pec-deck': ['klatka'],
    'cable-crossover': ['klatka'],

    ohp: ['barki', 'triceps'],
    'lat-raise': ['barki'],

    triceps: ['triceps'],
    'overhead-triceps-ext': ['triceps'],

    'db-curl': ['biceps'],
    'incline-curl': ['biceps'],
    'hammer-curl': ['biceps'],

    'leg-press': ['nogi'],
    'leg-curl': ['nogi'],
    'leg-ext': ['nogi'],
    'calf-raise': ['nogi'],
    bss: ['nogi'],
    'kb-swing': ['nogi', 'plecy'],

    'hanging-knee-raise': ['brzuch'],
    'cable-crunch': ['brzuch'],
    pallof: ['brzuch'],
    landmine: ['brzuch', 'barki']
};

/* Ćwiczenie spoza mapy (dodane ręcznie do planu) nie wywala liczenia —
   po prostu nie trafia do żadnej partii. */
export function musclesFor(exerciseId) {
    return MUSCLES[exerciseId] ?? [];
}

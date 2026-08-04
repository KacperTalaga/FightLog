/* Tygodniowy plan treningowy — dane startowe (seed) aplikacji.
   Tablica dni zaczyna się od poniedziałku (patrz planDayIndex w utils.js).

   Pola ćwiczenia:
     sets        — liczba serii
     repRange    — [dolna, górna] granica powtórzeń; równe wartości = sztywna liczba
     startWeight — ciężar startowy w kg, null gdy dobierany na miejscu
     increment   — skok ciężaru przy progresji (2.5 góra, 5 nogi i stosy, 2 hantle,
                   4 kettlebell — tyle, ile realnie da się dołożyć w klubie)
     bodyweight  — true gdy bazą jest masa ciała; startWeight to wtedy dodatkowe obciążenie
     perSide     — zakres powtórzeń dotyczy jednej strony/ręki
     unit        — 'powt' albo 'sek' (izometria); sekundy nie idą do wyliczeń 1RM
     technique   — wskazówka pokazywana w widoku PLAN */

export const PLAN_VERSION = 1;

const DEFAULTS = {
    sets: 3,
    repRange: [8, 12],
    startWeight: null,
    increment: 2.5,
    bodyweight: false,
    perSide: false,
    unit: 'powt',
    technique: ''
};

const DAYS = [
    {
        key: 'monday', day: 'Poniedziałek', type: 'Boks', icon: '🥊',
        isCombat: true, isRest: false,
        note: 'Normalna sesja bokserska.',
        exercises: [],
        finisher: null
    },
    {
        key: 'tuesday', day: 'Wtorek', type: 'Pull + Nogi', icon: '🔩',
        isCombat: false, isRest: false,
        note: 'Plecy + nogi + biceps. Podciąganie i wiosłowanie na objętość pleców.',
        exercises: [
            { id: 'pullup', name: 'Podciąganie', tag: 'compound', sets: 4, repRange: [6, 10], startWeight: 0, increment: 5, bodyweight: true, technique: 'Gdy 4x10 → dodaj +5 kg. Pełny zakres.' },
            { id: 'db-row', name: 'Wiosłowanie hantlem', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 22, increment: 2, perSide: true, technique: 'Łopatka: ściągnij na dole, kontroluj powrót.' },
            { id: 'leg-press', name: 'Leg press', tag: 'compound', sets: 3, repRange: [10, 15], startWeight: 100, increment: 5, technique: 'Stopy wysoko i szeroko. Kolana nie blokuj.' },
            { id: 'leg-curl', name: 'Leg curl', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, technique: 'Prewencja kontuzji kolana. 2s excentric.' },
            { id: 'db-curl', name: 'Curl hantlami', tag: 'izolacja', sets: 3, repRange: [8, 10], startWeight: 18, increment: 2, perSide: true, technique: 'Stojąc, na zmianę. Bez kiwania.' },
            { id: 'face-pull', name: 'Face pull', tag: 'izolacja', sets: 3, repRange: [15, 20], startWeight: null, increment: 2.5, technique: 'Łokcie wysoko, ściśnij łopatki 1s.' },
            { id: 'incline-curl', name: 'Incline DB curl', tag: 'izolacja', sets: 2, repRange: [12, 15], startWeight: 10, increment: 2, perSide: true, technique: 'Ławka skośna, pełne rozciągnięcie bicepsa.' },
            { id: 'hanging-knee-raise', name: 'Hanging knee raise', tag: 'izolacja', sets: 2, repRange: [15, 20], startWeight: 0, increment: 2.5, bodyweight: true, technique: 'Brzuch. Bez bujania, kontrolowany powrót.' }
        ],
        finisher: { name: 'Skakanka HIIT', detail: '5x1min / 30s rest (~8 min)', technique: 'Progresja: skracaj rest 30s→20s→15s co 2 tyg.', tag: 'cardio' }
    },
    {
        key: 'wednesday', day: 'Środa', type: 'Boks', icon: '🥊',
        isCombat: true, isRest: false,
        note: 'Plecy i nogi z wtorku nie kolidują z ciosami.',
        exercises: [],
        finisher: null
    },
    {
        key: 'thursday', day: 'Czwartek', type: 'Push + Combat', icon: '💥',
        isCombat: false, isRest: false,
        note: 'Eksplozja + push + izolacja. Landmine i KB na start gdy świeży.',
        exercises: [
            { id: 'landmine', name: 'Landmine rotation', tag: 'combat', sets: 3, repRange: [5, 5], startWeight: 20, increment: 2.5, perSide: true, technique: 'Eksplozywna rotacja bioder. 60-90s przerwy.' },
            { id: 'kb-swing', name: 'Kettlebell swing', tag: 'combat', sets: 3, repRange: [10, 12], startWeight: 16, increment: 4, technique: 'Eksplozja bioder, NIE przysiadu. Napnij pośladki.' },
            { id: 'bench', name: 'Wyciskanie sztangi — płaska', tag: 'compound', sets: 4, repRange: [6, 10], startWeight: 70, increment: 2.5, technique: 'Łopatki ściągnięte, łuk w plecach.' },
            { id: 'ohp', name: 'OHP — wyciskanie stojąc', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 35, increment: 2.5, technique: 'Stojąc, napięte pośladki i brzuch.' },
            { id: 'pec-deck', name: 'Rozpiętki (pec deck)', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, technique: 'Pełne rozciągnięcie + skurcz 1s.' },
            { id: 'lat-raise', name: 'Lateral raise', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: 9, increment: 2, technique: 'Do poziomu barków, lekki pochył. Ciężar = jeden hantel.' },
            { id: 'triceps', name: 'Triceps pushdown', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, technique: 'Łokcie przy tułowiu. Pełny wyprost.' },
            { id: 'overhead-triceps-ext', name: 'Overhead triceps extension', tag: 'izolacja', sets: 2, repRange: [12, 15], startWeight: 35, increment: 5, technique: 'Linka lub hantla. Łokcie blisko głowy.' },
            { id: 'pallof', name: 'Pallof press', tag: 'combat', sets: 3, repRange: [10, 10], startWeight: null, increment: 2.5, perSide: true, unit: 'sek', technique: 'Antyrotacja = moc ciosów.' }
        ],
        finisher: { name: 'Skakanka HIIT', detail: '5x1min / 30s rest (~8 min)', technique: 'Progresja: skracaj rest 30s→20s→15s co 2 tyg.', tag: 'cardio' }
    },
    {
        key: 'friday', day: 'Piątek', type: 'Kickboxing', icon: '🦵',
        isCombat: true, isRest: false,
        note: 'Pełna sesja kickboxingowa.',
        exercises: [],
        finisher: null
    },
    {
        key: 'saturday', day: 'Sobota', type: 'Upper Mix + Nogi', icon: '⚡',
        isCombat: false, isRest: false,
        note: 'Druga dawka objętości. Bulgarian na start — transfer do kopnięć.',
        exercises: [
            { id: 'bss', name: 'Bulgarian split squat', tag: 'compound', sets: 3, repRange: [8, 10], startWeight: 14, increment: 2, perSide: true, technique: 'Tylna noga na ławce. Ciężar = jeden hantel z pary. Transfer do kopnięć.' },
            { id: 'pullup2', name: 'Podciąganie / wiosłowanie', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 0, increment: 5, bodyweight: true, technique: 'Druga dawka objętości na plecy.' },
            { id: 'incline-db', name: 'Hantle skośna 30°', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 26, increment: 2, technique: 'Górna klatka. Inny kąt niż czwartek. Ciężar = jeden hantel.' },
            { id: 'leg-ext', name: 'Leg extension', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: 50, increment: 5, technique: 'Szczytowy skurcz 1s. Kontrolowany excentric.' },
            { id: 'rear-delt', name: 'Rear delt maszyna', tag: 'izolacja', sets: 3, repRange: [15, 15], startWeight: null, increment: 5, technique: 'Ściśnij łopatki na końcu.' },
            { id: 'hammer-curl', name: 'Curl młotkowy', tag: 'izolacja', sets: 3, repRange: [10, 12], startWeight: 14, increment: 2, perSide: true, technique: 'Brachialis + przedramiona = grip w rękawicach.' },
            { id: 'cable-crossover', name: 'Cable crossover', tag: 'izolacja', sets: 2, repRange: [12, 15], startWeight: null, increment: 5, technique: 'Dobierz ciężar. Skurcz w środku 1s.' },
            { id: 'calf-raise', name: 'Calf raise', tag: 'izolacja', sets: 3, repRange: [15, 20], startWeight: null, increment: 5, technique: 'Footwork w ringu. Pełen zakres.' },
            { id: 'cable-crunch', name: 'Cable crunch', tag: 'izolacja', sets: 2, repRange: [15, 20], startWeight: null, increment: 5, technique: 'Brzuch na lince. Zwijaj tułów, nie ciągnij rękami.' }
        ],
        finisher: null
    },
    {
        key: 'sunday', day: 'Niedziela', type: 'Rest', icon: '😴',
        isCombat: false, isRest: true,
        note: 'Foam rolling 10-15 min, spacer, rozciąganie.',
        exercises: [],
        finisher: null
    }
];

/* Uzupełnia braki wartościami domyślnymi. repRange kopiujemy do nowej tablicy —
   inaczej wszystkie ćwiczenia bez własnego zakresu dzieliłyby jeden obiekt
   i edycja zakresu w jednym zmieniałaby go w pozostałych. */
function normalizeExercise(exercise) {
    return {
        ...DEFAULTS,
        ...exercise,
        repRange: [...(exercise.repRange ?? DEFAULTS.repRange)]
    };
}

function normalizeDay(day) {
    return { ...day, exercises: day.exercises.map(normalizeExercise) };
}

export const PLAN = DAYS.map(normalizeDay);

/* Ciężar bazowy ćwiczenia, gdy nie ma jeszcze historii.
   Przy ćwiczeniach z masy ciała zwracamy realną liczbę (masa ciała + obciążenie),
   bo weight/reps trafiają potem do wzoru na 1RM i muszą być liczbami. */
export function baseWeight(exercise, bodyweightKg = null) {
    if (!exercise.bodyweight) return exercise.startWeight;
    if (bodyweightKg == null) return null;
    return Math.round((bodyweightKg + (exercise.startWeight ?? 0)) * 10) / 10;
}

export function findExercise(plan, exerciseId) {
    for (const day of plan.days) {
        const exercise = day.exercises.find(item => item.id === exerciseId);
        if (exercise) return exercise;
    }
    return null;
}

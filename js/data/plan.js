/* Tygodniowy plan treningowy — dane startowe aplikacji.
   Tablica zaczyna się od poniedziałku (patrz planDayIndex w utils.js).
   Etap 2 przeniesie te dane na strukturę z repRange/increment/startWeight
   wymaganą przez silnik progresji. */

export const PLAN = [
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
            { id: 'pullup', name: 'Podciąganie', sets: 4, reps: '6-10', weight: 'BW', tag: 'compound', technique: 'Gdy 4x10 → dodaj +5 kg. Pełny zakres.' },
            { id: 'db-row', name: 'Wiosłowanie hantlem', sets: 3, reps: '8-12/str', weight: 22, tag: 'compound', technique: 'Łopatka: ściągnij na dole, kontroluj powrót.' },
            { id: 'leg-press', name: 'Leg press', sets: 3, reps: '10-15', weight: 100, tag: 'compound', technique: 'Stopy wysoko i szeroko. Kolana nie blokuj.' },
            { id: 'leg-curl', name: 'Leg curl', sets: 3, reps: '12-15', weight: null, tag: 'izolacja', technique: 'Prewencja kontuzji kolana. 2s excentric.' },
            { id: 'db-curl', name: 'Curl hantlami', sets: 3, reps: '8-10/r', weight: '18-20', tag: 'izolacja', technique: 'Stojąc, na zmianę. Bez kiwania.' },
            { id: 'face-pull', name: 'Face pull', sets: 3, reps: '15-20', weight: null, tag: 'izolacja', technique: 'Łokcie wysoko, ściśnij łopatki 1s.' },
            { id: 'incline-curl', name: 'Incline DB curl', sets: 2, reps: '12-15', weight: 10, tag: 'izolacja', technique: 'Ławka skośna, pełne rozciągnięcie bicepsa.' },
            { id: 'hanging-knee-raise', name: 'Hanging knee raise', sets: 2, reps: '15-20', weight: 'BW', tag: 'izolacja', technique: 'Brzuch. Bez bujania, kontrolowany powrót.' }
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
            { id: 'landmine', name: 'Landmine rotation', sets: 3, reps: '5/str', weight: 20, tag: 'combat', technique: 'Eksplozywna rotacja bioder. 60-90s przerwy.' },
            { id: 'kb-swing', name: 'Kettlebell swing', sets: 3, reps: '10-12', weight: 16, tag: 'combat', technique: 'Eksplozja bioder, NIE przysiadu. Napnij pośladki.' },
            { id: 'bench', name: 'Wyciskanie sztangi — płaska', sets: 4, reps: '6-10', weight: 70, tag: 'compound', technique: 'Łopatki ściągnięte, łuk w plecach.' },
            { id: 'ohp', name: 'OHP — wyciskanie stojąc', sets: 3, reps: '8-12', weight: 35, tag: 'compound', technique: 'Stojąc, napięte pośladki i brzuch.' },
            { id: 'pec-deck', name: 'Rozpiętki (pec deck)', sets: 3, reps: '12-15', weight: null, tag: 'izolacja', technique: 'Pełne rozciągnięcie + skurcz 1s.' },
            { id: 'lat-raise', name: 'Lateral raise', sets: 3, reps: '12-15', weight: 9, tag: 'izolacja', technique: 'Do poziomu barków, lekki pochył.' },
            { id: 'triceps', name: 'Triceps pushdown', sets: 3, reps: '12-15', weight: null, tag: 'izolacja', technique: 'Łokcie przy tułowiu. Pełny wyprost.' },
            { id: 'overhead-triceps-ext', name: 'Overhead triceps extension', sets: 2, reps: '12-15', weight: 35, tag: 'izolacja', technique: 'Linka lub hantla. Łokcie blisko głowy.' },
            { id: 'pallof', name: 'Pallof press', sets: 3, reps: '10s/str', weight: null, tag: 'combat', technique: 'Antyrotacja = moc ciosów.' }
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
            { id: 'bss', name: 'Bulgarian split squat', sets: 3, reps: '8-10/n', weight: '2x14', tag: 'compound', technique: 'Tylna noga na ławce. Transfer do kopnięć.' },
            { id: 'pullup2', name: 'Podciąganie / wiosłowanie', sets: 3, reps: '8-12', weight: 'BW', tag: 'compound', technique: 'Druga dawka objętości na plecy.' },
            { id: 'incline-db', name: 'Hantle skośna 30°', sets: 3, reps: '8-12', weight: 26, tag: 'compound', technique: 'Górna klatka. Inny kąt niż czwartek.' },
            { id: 'leg-ext', name: 'Leg extension', sets: 3, reps: '12-15', weight: 50, tag: 'izolacja', technique: 'Szczytowy skurcz 1s. Kontrolowany excentric.' },
            { id: 'rear-delt', name: 'Rear delt maszyna', sets: 3, reps: '15', weight: null, tag: 'izolacja', technique: 'Ściśnij łopatki na końcu.' },
            { id: 'hammer-curl', name: 'Curl młotkowy', sets: 3, reps: '10-12', weight: '14-16', tag: 'izolacja', technique: 'Brachialis + przedramiona = grip w rękawicach.' },
            { id: 'cable-crossover', name: 'Cable crossover', sets: 2, reps: '12-15', weight: null, tag: 'izolacja', technique: 'Dobierz ciężar. Skurcz w środku 1s.' },
            { id: 'calf-raise', name: 'Calf raise', sets: 3, reps: '15-20', weight: null, tag: 'izolacja', technique: 'Footwork w ringu. Pełen zakres.' },
            { id: 'cable-crunch', name: 'Cable crunch', sets: 2, reps: '15-20', weight: 'BW', tag: 'izolacja', technique: 'Brzuch na lince. Zwijaj tułów, nie ciągnij rękami.' }
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

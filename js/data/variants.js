/* Katalog wariantów ćwiczeń pogrupowanych po wzorcu ruchowym.

   Silnik rotacji ([../rotation.js]) wymienia ćwiczenie wyłącznie w obrębie
   jednego wzorca — wyciskanie zastępuje inne wyciskanie, nigdy przysiad.
   Dzięki temu struktura treningu zostaje ta sama, zmienia się bodziec.

   Każdy wariant ma komplet pól ćwiczenia planu (patrz plan.js) plus `muscles`
   do liczenia objętości tygodniowej. Ćwiczenia z aktualnego planu też tu są —
   inaczej rotacja nie mogłaby do nich wrócić. */

export const PATTERNS = {
    'ciag-pion': 'Ciąg pionowy',
    'ciag-poziom': 'Ciąg poziomy',
    'push-poziom': 'Wyciskanie poziome',
    'push-pion': 'Wyciskanie pionowe',
    'nogi-wypych': 'Nogi — wypych',
    'nogi-zgiecie': 'Nogi — zginanie',
    biceps: 'Biceps',
    triceps: 'Triceps',
    'barki-bok': 'Barki — bok',
    'barki-tyl': 'Barki — tył',
    'klatka-izolacja': 'Klatka — izolacja',
    brzuch: 'Brzuch',
    lydki: 'Łydki'
};

export const VARIANTS = [
    /* --- Ciąg pionowy --- */
    { id: 'pullup', pattern: 'ciag-pion', name: 'Podciąganie', tag: 'compound', sets: 4, repRange: [6, 10], startWeight: 0, increment: 2.5, bodyweight: true, muscles: ['plecy', 'biceps'], technique: 'Gdy 4x10 → dodaj obciążenie. Pełny zakres.' },
    { id: 'chinup', pattern: 'ciag-pion', name: 'Podciąganie podchwytem', tag: 'compound', sets: 4, repRange: [6, 10], startWeight: 0, increment: 2.5, bodyweight: true, muscles: ['plecy', 'biceps'], technique: 'Chwyt podchwytem na szerokość barków. Więcej bicepsa niż w nachwycie.' },
    /* Drugi slot pleców z planu wyjściowego. `legacy` znaczy: może zostać
       zrotowany na coś innego, ale sam nie jest celem rotacji — nazwa
       „podciąganie / wiosłowanie” opisuje slot, nie konkretne ćwiczenie. */
    { id: 'pullup2', pattern: 'ciag-pion', legacy: true, name: 'Podciąganie / wiosłowanie', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 0, increment: 2.5, bodyweight: true, muscles: ['plecy', 'biceps'], technique: 'Druga dawka objętości na plecy.' },
    { id: 'lat-pulldown', pattern: 'ciag-pion', name: 'Ściąganie drążka wyciągu', tag: 'compound', sets: 4, repRange: [8, 12], startWeight: null, increment: 5, muscles: ['plecy', 'biceps'], technique: 'Klatka w górę, łokcie do kieszeni. Bez odchylania tułowia.' },
    { id: 'neutral-pulldown', pattern: 'ciag-pion', name: 'Ściąganie uchwytem młotkowym', tag: 'compound', sets: 4, repRange: [8, 12], startWeight: null, increment: 5, muscles: ['plecy', 'biceps'], technique: 'Chwyt neutralny odciąża barki. Dobry wariant przy podrażnieniu.' },

    /* --- Ciąg poziomy --- */
    { id: 'db-row', pattern: 'ciag-poziom', name: 'Wiosłowanie hantlem', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 22, increment: 2, perSide: true, muscles: ['plecy', 'biceps'], technique: 'Łopatka: ściągnij na dole, kontroluj powrót.' },
    { id: 'barbell-row', pattern: 'ciag-poziom', name: 'Wiosłowanie sztangą', tag: 'compound', sets: 3, repRange: [6, 10], startWeight: 50, increment: 2.5, muscles: ['plecy', 'biceps'], technique: 'Tułów blisko poziomu, plecy proste. Sztanga do pępka.' },
    { id: 'cable-row', pattern: 'ciag-poziom', name: 'Wiosłowanie na wyciągu siedząc', tag: 'compound', sets: 3, repRange: [10, 14], startWeight: null, increment: 5, muscles: ['plecy', 'biceps'], technique: 'Nie bujaj tułowiem. Pauza w skurczu.' },
    { id: 'chest-supported-row', pattern: 'ciag-poziom', name: 'Wiosłowanie na ławce skośnej', tag: 'compound', sets: 3, repRange: [10, 14], startWeight: 20, increment: 2, muscles: ['plecy', 'biceps'], technique: 'Klatka oparta o ławkę — zero pomocy dolnym grzbietem.' },

    /* --- Wyciskanie poziome --- */
    { id: 'bench', pattern: 'push-poziom', name: 'Wyciskanie sztangi — płaska', tag: 'compound', sets: 4, repRange: [6, 10], startWeight: 70, increment: 2.5, muscles: ['klatka', 'triceps', 'barki'], technique: 'Łopatki ściągnięte, łuk w plecach.' },
    { id: 'incline-db', pattern: 'push-poziom', name: 'Hantle skośna 30°', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 26, increment: 2, muscles: ['klatka', 'triceps', 'barki'], technique: 'Górna klatka. Ciężar = jeden hantel.' },
    { id: 'flat-db-press', pattern: 'push-poziom', name: 'Wyciskanie hantli — płaska', tag: 'compound', sets: 4, repRange: [8, 12], startWeight: 26, increment: 2, muscles: ['klatka', 'triceps', 'barki'], technique: 'Większy zakres niż sztanga, łagodniejsze dla barków.' },
    { id: 'dips', pattern: 'push-poziom', name: 'Dipy na poręczach', tag: 'compound', sets: 3, repRange: [6, 12], startWeight: 0, increment: 2.5, bodyweight: true, muscles: ['klatka', 'triceps', 'barki'], technique: 'Lekki pochył do przodu = więcej klatki. Bez zapadania w barkach.' },
    { id: 'machine-chest-press', pattern: 'push-poziom', name: 'Wyciskanie na maszynie', tag: 'compound', sets: 3, repRange: [10, 14], startWeight: null, increment: 5, muscles: ['klatka', 'triceps', 'barki'], technique: 'Wariant bez stabilizacji — dobry po ciężkim tygodniu walk.' },

    /* --- Wyciskanie pionowe --- */
    { id: 'ohp', pattern: 'push-pion', name: 'OHP — wyciskanie stojąc', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 35, increment: 2.5, muscles: ['barki', 'triceps'], technique: 'Stojąc, napięte pośladki i brzuch.' },
    { id: 'db-shoulder-press', pattern: 'push-pion', name: 'Wyciskanie hantli nad głowę', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 16, increment: 2, muscles: ['barki', 'triceps'], technique: 'Siedząc lub stojąc. Ciężar = jeden hantel.' },
    { id: 'arnold-press', pattern: 'push-pion', name: 'Arnold press', tag: 'compound', sets: 3, repRange: [10, 14], startWeight: 12, increment: 2, muscles: ['barki', 'triceps'], technique: 'Rotacja w trakcie ruchu. Lżej niż zwykłe wyciskanie.' },
    { id: 'landmine-press', pattern: 'push-pion', name: 'Landmine press', tag: 'combat', sets: 3, repRange: [8, 12], startWeight: 20, increment: 2.5, perSide: true, muscles: ['barki', 'triceps'], technique: 'Skos między poziomem a pionem. Transfer do prostych ciosów.' },

    /* --- Nogi: wypych --- */
    { id: 'leg-press', pattern: 'nogi-wypych', name: 'Leg press', tag: 'compound', sets: 3, repRange: [10, 15], startWeight: 100, increment: 5, muscles: ['nogi'], technique: 'Stopy wysoko i szeroko. Kolana nie blokuj.' },
    { id: 'bss', pattern: 'nogi-wypych', name: 'Bulgarian split squat', tag: 'compound', sets: 3, repRange: [8, 10], startWeight: 14, increment: 2, perSide: true, muscles: ['nogi'], technique: 'Tylna noga na ławce. Ciężar = jeden hantel z pary.' },
    { id: 'hack-squat', pattern: 'nogi-wypych', name: 'Hack squat', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: null, increment: 5, muscles: ['nogi'], technique: 'Plecy oparte, pełny zakres. Mocne obciążenie czworogłowych.' },
    { id: 'goblet-squat', pattern: 'nogi-wypych', name: 'Goblet squat', tag: 'compound', sets: 3, repRange: [10, 15], startWeight: 20, increment: 4, muscles: ['nogi'], technique: 'Hantel/kettlebell przy klatce. Tułów pionowo.' },
    { id: 'leg-ext', pattern: 'nogi-wypych', name: 'Leg extension', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: 50, increment: 5, muscles: ['nogi'], technique: 'Szczytowy skurcz 1s. Kontrolowany excentric.' },

    /* --- Nogi: zginanie --- */
    { id: 'leg-curl', pattern: 'nogi-zgiecie', name: 'Leg curl', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, muscles: ['nogi'], technique: 'Prewencja kontuzji kolana. 2s excentric.' },
    { id: 'rdl', pattern: 'nogi-zgiecie', name: 'Rumuński martwy ciąg', tag: 'compound', sets: 3, repRange: [8, 12], startWeight: 50, increment: 5, muscles: ['nogi', 'plecy'], technique: 'Biodra w tył, sztanga blisko nóg. Zatrzymaj tuż pod kolanem.' },
    { id: 'nordic-curl', pattern: 'nogi-zgiecie', name: 'Nordic curl', tag: 'izolacja', sets: 3, repRange: [5, 8], startWeight: 0, increment: 2.5, bodyweight: true, muscles: ['nogi'], technique: 'Opuszczanie w 3–4 s. Bardzo mocna prewencja dwugłowych.' },
    { id: 'kb-swing', pattern: 'nogi-zgiecie', name: 'Kettlebell swing', tag: 'combat', sets: 3, repRange: [10, 12], startWeight: 16, increment: 4, muscles: ['nogi', 'plecy'], technique: 'Eksplozja bioder, NIE przysiadu. Napnij pośladki.' },

    /* --- Biceps --- */
    { id: 'db-curl', pattern: 'biceps', name: 'Curl hantlami', tag: 'izolacja', sets: 3, repRange: [8, 10], startWeight: 18, increment: 2, perSide: true, muscles: ['biceps'], technique: 'Stojąc, na zmianę. Bez kiwania.' },
    { id: 'hammer-curl', pattern: 'biceps', name: 'Curl młotkowy', tag: 'izolacja', sets: 3, repRange: [10, 12], startWeight: 14, increment: 2, perSide: true, muscles: ['biceps'], technique: 'Brachialis + przedramiona = grip w rękawicach.' },
    { id: 'incline-curl', pattern: 'biceps', name: 'Incline DB curl', tag: 'izolacja', sets: 2, repRange: [12, 15], startWeight: 10, increment: 2, perSide: true, muscles: ['biceps'], technique: 'Ławka skośna, pełne rozciągnięcie bicepsa.' },
    { id: 'cable-curl', pattern: 'biceps', name: 'Curl na wyciągu', tag: 'izolacja', sets: 3, repRange: [10, 14], startWeight: null, increment: 5, muscles: ['biceps'], technique: 'Stałe napięcie w całym zakresie.' },
    { id: 'preacher-curl', pattern: 'biceps', name: 'Curl na modlitewniku', tag: 'izolacja', sets: 3, repRange: [10, 12], startWeight: null, increment: 5, muscles: ['biceps'], technique: 'Zero oszukiwania tułowiem. Kontroluj dół ruchu.' },

    /* --- Triceps --- */
    { id: 'triceps', pattern: 'triceps', name: 'Triceps pushdown', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, muscles: ['triceps'], technique: 'Łokcie przy tułowiu. Pełny wyprost.' },
    { id: 'overhead-triceps-ext', pattern: 'triceps', name: 'Overhead triceps extension', tag: 'izolacja', sets: 2, repRange: [12, 15], startWeight: 35, increment: 5, muscles: ['triceps'], technique: 'Linka lub hantla. Łokcie blisko głowy.' },
    { id: 'skullcrusher', pattern: 'triceps', name: 'Wyciskanie francuskie', tag: 'izolacja', sets: 3, repRange: [10, 12], startWeight: 25, increment: 2.5, muscles: ['triceps'], technique: 'Łamana sztanga, łokcie nieruchomo. Do czoła lub za głowę.' },
    { id: 'rope-pushdown', pattern: 'triceps', name: 'Pushdown linką', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, muscles: ['triceps'], technique: 'Rozejdź linkę na końcu ruchu.' },

    /* --- Barki: bok --- */
    { id: 'lat-raise', pattern: 'barki-bok', name: 'Lateral raise', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: 9, increment: 2, muscles: ['barki'], technique: 'Do poziomu barków, lekki pochył. Ciężar = jeden hantel.' },
    { id: 'cable-lat-raise', pattern: 'barki-bok', name: 'Odwodzenie na wyciągu', tag: 'izolacja', sets: 3, repRange: [12, 18], startWeight: null, increment: 5, perSide: true, muscles: ['barki'], technique: 'Stałe napięcie także na dole ruchu.' },
    { id: 'machine-lat-raise', pattern: 'barki-bok', name: 'Odwodzenie na maszynie', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, muscles: ['barki'], technique: 'Wariant bez stabilizacji — łatwo dołożyć objętość.' },

    /* --- Barki: tył --- */
    { id: 'face-pull', pattern: 'barki-tyl', name: 'Face pull', tag: 'izolacja', sets: 3, repRange: [15, 20], startWeight: null, increment: 2.5, muscles: ['barki', 'plecy'], technique: 'Łokcie wysoko, ściśnij łopatki 1s.' },
    { id: 'rear-delt', pattern: 'barki-tyl', name: 'Rear delt maszyna', tag: 'izolacja', sets: 3, repRange: [15, 15], startWeight: null, increment: 5, muscles: ['barki'], technique: 'Ściśnij łopatki na końcu.' },
    { id: 'reverse-fly', pattern: 'barki-tyl', name: 'Odwrotne rozpiętki hantlami', tag: 'izolacja', sets: 3, repRange: [12, 18], startWeight: 8, increment: 2, muscles: ['barki'], technique: 'Tułów w opadzie, łokcie lekko ugięte.' },

    /* --- Klatka: izolacja --- */
    { id: 'pec-deck', pattern: 'klatka-izolacja', name: 'Rozpiętki (pec deck)', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: null, increment: 5, muscles: ['klatka'], technique: 'Pełne rozciągnięcie + skurcz 1s.' },
    { id: 'cable-crossover', pattern: 'klatka-izolacja', name: 'Cable crossover', tag: 'izolacja', sets: 2, repRange: [12, 15], startWeight: null, increment: 5, muscles: ['klatka'], technique: 'Dobierz ciężar. Skurcz w środku 1s.' },
    { id: 'db-fly', pattern: 'klatka-izolacja', name: 'Rozpiętki hantlami', tag: 'izolacja', sets: 3, repRange: [12, 15], startWeight: 12, increment: 2, muscles: ['klatka'], technique: 'Łokcie lekko ugięte przez cały ruch.' },

    /* --- Brzuch --- */
    { id: 'hanging-knee-raise', pattern: 'brzuch', name: 'Hanging knee raise', tag: 'izolacja', sets: 2, repRange: [15, 20], startWeight: 0, increment: 2.5, bodyweight: true, muscles: ['brzuch'], technique: 'Bez bujania, kontrolowany powrót.' },
    { id: 'cable-crunch', pattern: 'brzuch', name: 'Cable crunch', tag: 'izolacja', sets: 2, repRange: [15, 20], startWeight: null, increment: 5, muscles: ['brzuch'], technique: 'Zwijaj tułów, nie ciągnij rękami.' },
    { id: 'pallof', pattern: 'brzuch', name: 'Pallof press', tag: 'combat', sets: 3, repRange: [10, 10], startWeight: null, increment: 2.5, perSide: true, unit: 'sek', muscles: ['brzuch'], technique: 'Antyrotacja = moc ciosów.' },
    { id: 'ab-wheel', pattern: 'brzuch', name: 'Ab wheel', tag: 'izolacja', sets: 3, repRange: [8, 12], startWeight: 0, increment: 2.5, bodyweight: true, muscles: ['brzuch'], technique: 'Miednica podwinięta, nie wypinaj lędźwi.' },
    { id: 'landmine', pattern: 'brzuch', name: 'Landmine rotation', tag: 'combat', sets: 3, repRange: [5, 5], startWeight: 20, increment: 2.5, perSide: true, muscles: ['brzuch', 'barki'], technique: 'Eksplozywna rotacja bioder. 60-90s przerwy.' },

    /* --- Łydki --- */
    { id: 'calf-raise', pattern: 'lydki', name: 'Calf raise', tag: 'izolacja', sets: 3, repRange: [15, 20], startWeight: null, increment: 5, muscles: ['nogi'], technique: 'Footwork w ringu. Pełen zakres.' },
    { id: 'seated-calf-raise', pattern: 'lydki', name: 'Calf raise siedząc', tag: 'izolacja', sets: 3, repRange: [12, 20], startWeight: null, increment: 5, muscles: ['nogi'], technique: 'Zgięte kolano = inny akcent niż stojąc.' }
];

const BY_ID = new Map(VARIANTS.map(variant => [variant.id, variant]));

export function variantById(id) {
    return BY_ID.get(id) ?? null;
}

export function patternOf(exerciseId) {
    return BY_ID.get(exerciseId)?.pattern ?? null;
}

export function variantsOfPattern(pattern) {
    return VARIANTS.filter(variant => variant.pattern === pattern);
}

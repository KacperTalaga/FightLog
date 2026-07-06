function $(sel) { return document.querySelector(sel); }
function $$(sel) { return [...document.querySelectorAll(sel)]; }

const PLAN = [
    {
        day: 'Poniedziałek', type: 'Boks', icon: '🥊',
        isCombat: true, isRest: false,
        note: 'Normalna sesja bokserska.',
        exercises: [],
        finisher: null
    },
    {
        day: 'Wtorek', type: 'Pull + Nogi', icon: '🔩',
        isCombat: false, isRest: false,
        note: 'Plecy + nogi + biceps. Podciąganie i wiosłowanie na objętość pleców.',
        exercises: [
            {id: 'pullup', name: 'Podciąganie', sets: 4, reps: '6-10', weight: 'BW', tag: 'compound', notes: 'Gdy 4x10 → dodaj +5 kg. Pełny zakres.'},
            {id: 'db-row', name: 'Wiosłowanie hantlem', sets: 3, reps: '8-12/str', weight: 22, tag: 'compound', notes: 'Łopatka: ściągnij na dole, kontroluj powrót.'},
            {id: 'leg-press', name: 'Prasa nożna', sets: 3, reps: '10-15', weight: 100, tag: 'compound', notes: 'Stopy wysoko i szeroko. Kolana nie blokuj.'},
            {id: 'leg-curl', name: 'Leg curl', sets: 3, reps: '12-15', weight: null, tag: 'isolation', notes: 'Prewencja kontuzji kolana. 2s excentric.'},
            {id: 'db-curl', name: 'Curl hantlami', sets: 3, reps: '8-10/r', weight: '18-20', tag: 'isolation', notes: 'Stojąc, na zmianę. Bez kiwania.'},
            {id: 'face-pull', name: 'Face pull', sets: 3, reps: '15-20', weight: null, tag: 'isolation', notes: 'Łokcie wysoko, ściśnij łopatki 1s.'}
        ],
        finisher: {name: 'Skakanka HIIT', detail: '5x1min / 30s rest (~8 min)', notes: 'Progresja: skracaj rest 30s→20s→15s co 2 tyg.', icon: '⚡', tag: 'finisher'}
    },
    {
        day: 'Środa', type: 'Boks', icon: '🥊',
        isCombat: true, isRest: false,
        note: 'Plecy i nogi z wtorku nie kolidują z ciosami.',
        exercises: [],
        finisher: null
    },
    {
        day: 'Czwartek', type: 'Push + Combat', icon: '💥',
        isCombat: false, isRest: false,
        note: 'Eksplozja + push + izolacja. Landmine i KB na start gdy świeży.',
        exercises: [
            {id: 'landmine', name: 'Landmine rotation', sets: 3, reps: '5/str', weight: 20, tag: 'combat', notes: 'Eksplozywna rotacja bioder. 60-90s przerwy.'},
            {id: 'kb-swing', name: 'Kettlebell swing', sets: 3, reps: '10-12', weight: 16, tag: 'combat', notes: 'Eksplozja bioder, NIE przysiadu. Napnij pośladki.'},
            {id: 'bench', name: 'Wyciskanie sztangi — płaska', sets: 4, reps: '6-10', weight: 70, tag: 'compound', notes: 'Łopatki ściągnięte, łuk w plecach.'},
            {id: 'ohp', name: 'OHP — wyciskanie stojąc', sets: 3, reps: '8-12', weight: 35, tag: 'compound', notes: 'Stojąc, napięte pośladki i brzuch.'},
            {id: 'pec-deck', name: 'Rozpiętki (pec deck)', sets: 3, reps: '12-15', weight: null, tag: 'isolation', notes: 'Pełne rozciągnięcie + skurcz 1s.'},
            {id: 'lat-raise', name: 'Lateral raise', sets: 3, reps: '12-15', weight: 9, tag: 'isolation', notes: 'Do poziomu barków, lekki pochył.'},
            {id: 'triceps', name: 'Triceps pushdown', sets: 3, reps: '12-15', weight: null, tag: 'isolation', notes: 'Łokcie przy tułowiu. Pełny wyprost.'},
            {id: 'pallof', name: 'Pallof press', sets: 3, reps: '10s/str', weight: null, tag: 'combat', notes: 'Antyrotacja = moc ciosów.'}
        ],
        finisher: {name: 'Bike/bieżnia sprinty', detail: '6-8x20s / 40s rest (~7 min)', notes: 'Progresja: więcej rund lub krótszy rest.', icon: '⚡', tag: 'finisher'}
    },
    {
        day: 'Piątek', type: 'Kickboxing', icon: '🦵',
        isCombat: true, isRest: false,
        note: 'Pełna sesja kickboxingowa.',
        exercises: [],
        finisher: null
    },
    {
        day: 'Sobota', type: 'Upper Mix + Nogi', icon: '⚡',
        isCombat: false, isRest: false,
        note: 'Druga dawka objętości. Bulgarian na start — transfer do kopnięć.',
        exercises: [
            {id: 'bss', name: 'Bulgarian split squat', sets: 3, reps: '8-10/n', weight: '2x14', tag: 'compound', notes: 'Tylna noga na ławce. Transfer do kopnięć.'},
            {id: 'pullup2', name: 'Podciąganie / wiosłowanie', sets: 3, reps: '8-12', weight: 'BW', tag: 'compound', notes: 'Druga dawka objętości na plecy.'},
            {id: 'incline-db', name: 'Hantle skośna 30°', sets: 3, reps: '8-12', weight: 26, tag: 'compound', notes: 'Górna klatka. Inny kąt niż czwartek.'},
            {id: 'leg-ext', name: 'Leg extension', sets: 3, reps: '12-15', weight: 50, tag: 'isolation', notes: 'Szczytowy skurcz 1s. Kontrolowany excentric.'},
            {id: 'rear-delt', name: 'Rear delt maszyna', sets: 3, reps: '15', weight: null, tag: 'isolation', notes: 'Ściśnij łopatki na końcu.'},
            {id: 'hammer-curl', name: 'Curl młotkowy', sets: 3, reps: '10-12', weight: '14-16', tag: 'isolation', notes: 'Brachialis + przedramiona = grip w rękawicach.'},
            {id: 'calf-raise', name: 'Calf raise', sets: 3, reps: '15-20', weight: null, tag: 'isolation', notes: 'Footwork w ringu. Pełen zakres.'}
        ],
        finisher: null
    },
    {
        day: 'Niedziela', type: 'Rest', icon: '😴',
        isCombat: false, isRest: true,
        note: 'Foam rolling 10-15 min, spacer, rozciąganie.',
        exercises: [],
        finisher: null
    }
];

function renderPlan() {
    const container = $('#view-plan');
    container.innerHTML = PLAN.map((plan, index) => {
        return `
        <div class="day-card">
            <div class="day-header" onclick="toggleDay(this)">
                <div class="day-name">${plan.icon} ${plan.day}</div>
                <div class="day-type">${plan.type}</div>
                <div class="day-chevron">></div>
            </div>
            <div class="day-body">
                <div class="day-note">${plan.note}</div>
                ${plan.exercises.map(ex => `
                    <div class="exercise-item">
                        <div class="exercise-top">
                            <div class="exercise-name">${ex.name}</div>
                            <div class="exercise-tag ${ex.tag}">${ex.tag}</div>
                        </div>
                        <div class="exercise-stats">
                            <div>
                                <div class="exercise-detail label">Serie</div>
                                <div class="exercise-detail">${ex.sets}x${ex.reps}</div>
                            </div>
                            <div>
                                <div class="exercise-detail label">Ciężar</div>
                                <div class="exercise-detail">${ex.weight == null ? "Dobierz" : ex.weight}</div>
                            </div>
                        </div>
                        <div class="exercise-notes">
                            ${ex.notes}
                        </div>
                    </div>
                `).join('')}
                ${plan.finisher == null ? `` : `
                   <div class="exercise-item">
                        <div class="exercise-top">
                            <div class="exercise-name">${plan.finisher.name}</div>
                            <div class="exercise-tag ${plan.finisher.tag}">${plan.finisher.tag}</div>
                        </div>
                        <div class="exercise-stats">
                            <div>
                                <div class="exercise-detail label">Protokół</div>
                                <div class="exercise-detail">${plan.finisher.detail}</div>
                            </div>
                        </div>
                        <div class="exercise-notes">
                            ${plan.finisher.notes}
                        </div>
                   </div>
                    `}
            </div>
        </div>
        `;
    }).join('');
}

function toggleDay(headerEl){
    headerEl.closest('.day-card').classList.toggle('open');
}

function switchView(viewName){
    const buttons = $$('nav button');
    buttons.forEach(element => {
        element.classList.toggle('active', element.dataset.view === viewName);
    });
    const divs = $$('.view');
    divs.forEach(element => {
        element.classList.toggle('active', element.id === 'view-' + viewName);
    });
}

$$('nav button').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
});

renderPlan();
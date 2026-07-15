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
            {id: 'leg-press', name: 'Leg press', sets: 3, reps: '10-15', weight: 100, tag: 'compound', notes: 'Stopy wysoko i szeroko. Kolana nie blokuj.'},
            {id: 'leg-curl', name: 'Leg curl', sets: 3, reps: '12-15', weight: null, tag: 'isolation', notes: 'Prewencja kontuzji kolana. 2s excentric.'},
            {id: 'db-curl', name: 'Curl hantlami', sets: 3, reps: '8-10/r', weight: '18-20', tag: 'isolation', notes: 'Stojąc, na zmianę. Bez kiwania.'},
            {id: 'face-pull', name: 'Face pull', sets: 3, reps: '15-20', weight: null, tag: 'isolation', notes: 'Łokcie wysoko, ściśnij łopatki 1s.'},
            {id: 'incline-curl', name: 'Incline DB Curls', sets: 2, reps:'12-15', weight: '10', tag:'isolation', notes: 'Ławka skośna'},
            {id: 'hanging-knee-raise', name: 'hanging knee raise', sets: 2, reps:'15-20', weight: 'BW', tag:'isolation', notes: 'ABS'}
            
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
            {id: 'pallof', name: 'Pallof press', sets: 3, reps: '10s/str', weight: null, tag: 'combat', notes: 'Antyrotacja = moc ciosów.'},
            {id: 'overhead-triceps-ext', name: 'Overhead triceps extension', sets: 2, reps: '12-15', weight: 35, tag: 'isolation', notes: 'linka lub hantla'},
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
            {id: 'calf-raise', name: 'Calf raise', sets: 3, reps: '15-20', weight: null, tag: 'isolation', notes: 'Footwork w ringu. Pełen zakres.'},
            {id: 'triceps-cable-ext', name: 'Cable crossover', sets: 2, reps: '12-15', weight: null, tag: 'isolation', notes: 'Dobierz wagę.'},
            {id: 'cable-crunch', name: 'Cable crunch', sets: 2, reps:'15-20', weight: 'BW', tag:'isolation', notes: 'ABS - maszyna/linka'}
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

var inputs = document.getElementsByClassName("exercise-form"); //collection
var submit = document.getElementById("submit");
var data = formatDate();
var sesja = {date: data, type: 'gym', exercises: []};
var exercise_obj = {id: 1, name: 'leg-press', sets: []};

if (localStorage.getItem(`log-${formatDate()}`) != null) {
	sesja = JSON.parse(localStorage.getItem(`log-${formatDate()}`));
}

const form = document.querySelector('form');
form.addEventListener('submit', function(event) {
	event.preventDefault(); // Zatrzymuje przeładowanie strony
});

submit.addEventListener("click", function () {
	var znalezione_cwiczenie = sesja.exercises.find(exe_obj => exe_obj.id === 1);
	if (znalezione_cwiczenie != null) {
		znalezione_cwiczenie.sets.push(...exercise_obj.sets); // rozpakowanie
	} else {
		sesja.exercises.push(exercise_obj);
	}
	var sesjaJSON = JSON.stringify(sesja);
	localStorage.setItem(`log-${formatDate()}`, sesjaJSON);
	console.log("Zapisano sesjaJSOn do localStorage");
	exercise_obj = {id: 1, name: 'leg-press', sets: []};
});

function openTab(event, tabName) {
	let btns = document.querySelectorAll(".tab-btn");
	let tabs = document.querySelectorAll(".tab");
	// Najpierw usuwamy ze wszystkich active, żeby później dać active na to kliknięte
	btns.forEach(btn => btn.classList.remove("active"));
	tabs.forEach(tab => tab.classList.remove("active"));
	
	// to jest działanie podczas onClick w buttonie.
	document.getElementById(tabName).classList.add("active");
	// i Teraz dodajemy do przycisku active
	event.currentTarget.classList.add("active");
}

// Dzień w zakładce gym
var date = new Date();
document.getElementById("date").innerHTML = formatDate();
// // wtorek, 14 lipca
// const dzien = date.toLocaleDateString('pl-PL', {weekday: 'long', day: 'numeric', month: 'long'});
const dzien = date.toLocaleDateString('pl-PL', {weekday: 'long'});
document.getElementById('day').innerHTML = dzien;

function addSet() {
	var set = {}
	for (let i = 0; i < inputs.length; i++) {
		var value = Number(inputs[i].value.trim());
		set[inputs[i].id] = value;
		inputs[i].value = "";
	}
	exercise_obj.sets.push(set);
}

function formatDate() {
	var date = new Date();
	const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	return isoDate;
}

function dropset() {
    var dropsets = document.querySelectorAll(".exercise-form-dropset");
    for (let i = 0; i < dropsets.length; i++){
        dropsets[i].classList.toggle("visible");
    }
}
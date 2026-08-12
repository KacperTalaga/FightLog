/* Zestaw sprawdzeń aplikacji — czysty Node, bez zależności i bez przeglądarki.

   Uruchomienie:  node tests/check.mjs

   Nie jest to pełny framework testowy, tylko siatka bezpieczeństwa na
   niezmienniki, które łatwo zepsuć przy kolejnych zmianach: wzór na 1RM,
   strefy czasowe w kluczach dat, reguły progresji i kompletność listy plików
   w service workerze. */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const check = (label, condition, got) => {
    if (!condition) problems.push(`${label} (dostałem: ${JSON.stringify(got)})`);
};

/* ---------- Środowisko przeglądarki, w minimalnym zakresie ---------- */

const memory = new Map();
globalThis.localStorage = {
    getItem: key => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: key => memory.delete(key)
};
globalThis.document = { getElementById: () => null };

const load = path => import(pathToFileURL(join(ROOT, path)).href);

const utils = await load('js/utils.js');
const store = await load('js/store.js');
const progression = await load('js/progression.js');
const stats = await load('js/stats.js');
const nutrition = await load('js/nutrition.js');
const { buildSessionForDay } = await load('js/data/session.js');

/* ---------- Daty ---------- */

check('sesja o 23:50 ucieka na następny dzień',
    utils.dateKey(new Date(2026, 7, 4, 23, 50)) === '2026-08-04',
    utils.dateKey(new Date(2026, 7, 4, 23, 50)));

check('parseDateKey przesuwa dobę', utils.parseDateKey('2026-08-04').getDate() === 4);
check('weekStartKey nie cofa do poniedziałku', utils.weekStartKey('2026-08-09') === '2026-08-03');
check('planDayIndex: poniedziałek != 0', utils.planDayIndex(new Date(2026, 7, 3)) === 0);
check('przecinek dziesiętny nieobsłużony', utils.parseNumber('72,5') === 72.5, utils.parseNumber('72,5'));
check('puste pole nie daje null', utils.parseNumber('') === null);
check('normalizeText nie radzi sobie z ł', utils.normalizeText('Białko') === 'bialko', utils.normalizeText('Białko'));
check('normalizeText nie zdejmuje ogonków', utils.normalizeText('Objętość') === 'objetosc');

/* ---------- Model danych ---------- */

const plan = store.getPlan();
check('plan nie ma 7 dni', plan.days.length === 7, plan.days.length);

const ranges = plan.days.flatMap(day => day.exercises.map(exercise => exercise.repRange));
check('repRange współdzieli referencje między ćwiczeniami', new Set(ranges).size === ranges.length);

const tuesday = plan.days.find(day => day.key === 'tuesday');
const session = buildSessionForDay(tuesday, { date: '2026-08-04', bodyweightKg: 79 });
const pullup = session.exercises.find(entry => entry.id === 'pullup');

check('sety nie są pre-buildowane', pullup.sets.length === 4, pullup.sets.length);
check('set nie startuje pusty', pullup.sets[0].weight === null && pullup.sets[0].done === false);
check('dropset nie startuje jako null', pullup.sets[0].dropset === null, pullup.sets[0].dropset);
pullup.sets[0].weight = 100;
check('sety współdzielą referencję', pullup.sets[1].weight === null, pullup.sets[1].weight);

/* ---------- Silnik progresji ---------- */

const bench = { id: 'bench', sets: 4, repRange: [6, 10], startWeight: 70, increment: 2.5, bodyweight: false, unit: 'powt' };
const today = new Date(2026, 7, 4);
/* Sesja ma tyle setów, ile przewiduje plan — niewykonane zostają puste.
   Bez tego dopełnienia „3 z 4 serii” wyglądałoby jak komplet. */
const mockSession = (date, rows, planned = bench.sets) => ({
    id: date, date, type: 'strength',
    exercises: [{
        id: 'bench',
        name: 'Wyciskanie',
        sets: rows.map(([weight, reps]) => ({ weight, reps, dropset: null, done: true }))
            .concat(Array.from({ length: Math.max(planned - rows.length, 0) },
                () => ({ weight: null, reps: null, dropset: null, done: false })))
    }]
});

const closed = progression.suggestNext(bench, [mockSession('2026-08-04', [[70, 10], [70, 10], [70, 10], [70, 10]])], { today });
check('zamknięty zakres nie podbił ciężaru', closed.weight === 72.5, closed.weight);
check('powtórzenia nie wróciły na dół zakresu', closed.reps === 6, closed.reps);

const open = progression.suggestNext(bench, [mockSession('2026-08-04', [[70, 8], [70, 7], [70, 8], [70, 6]])], { today });
check('niezamknięty zakres ruszył ciężar', open.weight === 70, open.weight);
check('nie celujemy o powtórzenie wyżej', open.reps === 9, open.reps);

const partial = progression.suggestNext(bench, [mockSession('2026-08-04', [[70, 10], [70, 10], [70, 10]])], { today });
check('trzy serie z czterech podbiły ciężar', partial.weight === 70, partial.weight);

const fresh = progression.suggestNext(bench, [], { today });
check('brak historii nie startuje z planu', fresh.weight === 70 && fresh.reps === 6, fresh);

/* ---------- Statystyki ---------- */

check('Epley 70x8 != 88.7', Math.round(stats.epley1RM(70, 8) * 10) / 10 === 88.7, stats.epley1RM(70, 8));
check('objętość serii źle liczona', stats.volumeOfSet({ weight: 70, reps: 10, done: true, dropset: null }) === 700);
check('dropset nie wchodzi do objętości',
    stats.volumeOfSet({ weight: 70, reps: 10, done: true, dropset: { weight: 50, reps: 5 } }) === 950);
check('nieodhaczona seria daje objętość',
    stats.volumeOfSet({ weight: 70, reps: 10, done: false, dropset: null }) === 0);

const weights = [
    { date: '2026-08-01', weight: 79.0 }, { date: '2026-08-02', weight: 79.4 },
    { date: '2026-08-03', weight: 78.8 }, { date: '2026-08-04', weight: 79.2 },
    { date: '2026-08-05', weight: 78.6 }, { date: '2026-08-06', weight: 79.0 },
    { date: '2026-08-07', weight: 78.4 }
];
check('średnia krocząca źle policzona', nutrition.movingAverage(weights).at(-1).value === 78.91,
    nutrition.movingAverage(weights).at(-1).value);
check('stary pomiar wchodzi do okna 7 dni',
    nutrition.movingAverage([{ date: '2026-07-20', weight: 85 }, ...weights.slice(0, 2)]).at(-1).value === 79.2);

/* ---------- PWA ---------- */

const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));
check('zła nazwa skrócona', manifest.short_name === 'FightLog', manifest.short_name);
check('brak trybu standalone', manifest.display === 'standalone', manifest.display);
check('zły theme_color', manifest.theme_color === '#0a0a0a', manifest.theme_color);
check('zły background_color', manifest.background_color === '#0a0a0a', manifest.background_color);
check('brak ikony maskable', manifest.icons.some(icon => icon.purpose === 'maskable'));
check('brak ikony 192', manifest.icons.some(icon => icon.sizes === '192x192'));
check('brak ikony 512', manifest.icons.some(icon => icon.sizes === '512x512'));

/* Nagłówek PNG: szerokość i wysokość siedzą w IHDR, bajty 16-24. */
function pngSize(path) {
    const buffer = readFileSync(join(ROOT, path));
    const signature = buffer.subarray(0, 8).toString('hex');
    if (signature !== '89504e470d0a1a0a') return null;
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

for (const icon of manifest.icons) {
    const size = pngSize(icon.src);
    const expected = Number(icon.sizes.split('x')[0]);
    check(`ikona ${icon.src} nie jest PNG-iem`, size !== null, size);
    check(`ikona ${icon.src} ma zły rozmiar`, size?.[0] === expected && size?.[1] === expected, size);
}

const appleIcon = pngSize('icons/apple-touch-icon.png');
check('brak apple-touch-icon', appleIcon?.[0] === 180, appleIcon);

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
['manifest.json', 'apple-mobile-web-app-capable', 'apple-mobile-web-app-status-bar-style', 'apple-touch-icon']
    .forEach(needle => check(`index.html bez ${needle}`, html.includes(needle)));

/* Lista szkieletu w service workerze musi obejmować każdy plik css i js,
   inaczej aplikacja offline wywali się na brakującym module. */
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const shell = [...sw.matchAll(/'\.\/([^']*)'/g)].map(match => match[1]);

function walk(directory) {
    return readdirSync(join(ROOT, directory)).flatMap(name => {
        const full = join(ROOT, directory, name);
        return statSync(full).isDirectory()
            ? walk(join(directory, name))
            : [relative(ROOT, full).replaceAll('\\', '/')];
    });
}

const sources = [...walk('css'), ...walk('js')].filter(path => /\.(css|js)$/.test(path));
sources.forEach(path => check(`sw.js nie cache'uje ${path}`, shell.includes(path), shell));
check('sw.js nie wersjonuje cache', /CACHE_NAME\s*=\s*'fightlog-v\d+'/.test(sw));
check('sw.js nie omija API Firestore', sw.includes('firestore.googleapis.com'));

shell.filter(path => /\.(css|js|png)$/.test(path)).forEach(path => {
    let exists = true;
    try {
        statSync(join(ROOT, path));
    } catch {
        exists = false;
    }
    check(`sw.js cache'uje nieistniejący plik ${path}`, exists);
});

/* ---------- Wynik ---------- */

console.log(problems.length
    ? `PROBLEMY (${problems.length}):\n- ${problems.join('\n- ')}`
    : 'OK — wszystkie sprawdzenia przeszły');

process.exit(problems.length ? 1 : 0);

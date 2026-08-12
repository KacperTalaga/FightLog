/* Widok DIETA — waga poranna, średnia krocząca, cele makro.

   Świadomie bez trackera jedzenia: od liczenia posiłków jest MyFitnessPal,
   tu liczy się tylko trend wagi i cele, do których się odnosisz. */

import { dateKey, escapeHtml, parseNumber, shortDate } from '../utils.js';
import { getWeights, saveWeight, getSettings, saveSettings } from '../store.js';
import {
    movingAverage, stallInfo, latestAverage, projectTarget,
    AVERAGE_WINDOW_DAYS, STALL_WINDOW_DAYS, KCAL_CUT
} from '../nutrition.js';
import { multiSeriesChart } from '../chart.js';

const MACROS = [
    { key: 'kcal', label: 'Kalorie', unit: 'kcal' },
    { key: 'protein', label: 'Białko', unit: 'g' },
    { key: 'carbs', label: 'Węglowodany', unit: 'g' },
    { key: 'fat', label: 'Tłuszcz', unit: 'g' }
];

let selectedDate = dateKey();

export function mountDiet(container) {
    container.innerHTML = render();

    if (container.dataset.mounted) return;
    container.addEventListener('change', handleChange);
    container.dataset.mounted = '1';
}

function render() {
    const weights = getWeights();
    const settings = getSettings();

    return `
    <h1 class="view__title">Dieta</h1>
    ${renderInput(weights)}
    ${renderAlert(weights, settings)}
    ${renderChart(weights, settings)}
    ${renderGoals(settings)}`;
}

/* ---------- Wpis wagi ---------- */

function renderInput(weights) {
    const entry = weights.find(item => item.date === selectedDate);
    const average = latestAverage(weights);
    const last = weights.at(-1);

    return `
    <section class="panel">
        <h2 class="panel__title">Waga poranna</h2>
        <div class="weight-form">
            <input class="field__input" type="date" id="diet-date" value="${selectedDate}" aria-label="Data pomiaru">
            <input class="field__input weight-form__value" type="text" inputmode="decimal" id="diet-weight"
                value="${entry?.weight ?? ''}" placeholder="78.4" aria-label="Waga w kilogramach">
            <span class="weight-form__unit">kg</span>
        </div>
        <p class="panel__hint">Jedna wartość na dzień, nadpisywalna. Waż się rano, po toalecie, przed śniadaniem —
            inaczej szum dzienny przykryje trend.</p>
        ${last ? `
        <div class="stat-row">
            <div class="stat">
                <div class="stat__label">Ostatni pomiar</div>
                <div class="stat__value">${last.weight} kg</div>
                <div class="stat__hint">${shortDate(last.date)}</div>
            </div>
            <div class="stat">
                <div class="stat__label">Średnia ${AVERAGE_WINDOW_DAYS} dni</div>
                <div class="stat__value">${average} kg</div>
                <div class="stat__hint">${weights.length} ${weights.length === 1 ? 'pomiar' : 'pomiarów'}</div>
            </div>
        </div>` : ''}
    </section>`;
}

/* ---------- Alert o zastoju ---------- */

function renderAlert(weights, settings) {
    const stall = stallInfo(weights);
    if (!stall?.stalled) return '';

    const change = stall.delta === 0 ? 'stoi w miejscu' : `poszła w górę o ${stall.delta} kg`;
    const proposed = Math.max(settings.macros.kcal - KCAL_CUT, 0);

    return `<div class="banner banner--warn">
        Średnia krocząca ${change} od ${STALL_WINDOW_DAYS} dni (${shortDate(stall.from)} → ${shortDate(stall.to)}).
        Rozważ obcięcie ${KCAL_CUT} kcal: <strong>${settings.macros.kcal} → ${proposed} kcal</strong>.
    </div>`;
}

/* ---------- Wykres ---------- */

function renderChart(weights, settings) {
    if (weights.length < 2) {
        return `<section class="panel">
            <p class="chart-empty">Dodaj co najmniej dwa pomiary, żeby zobaczyć trend.</p>
        </section>`;
    }

    const averages = movingAverage(weights);
    const labels = weights.map(entry => entry.date);
    const target = settings.targetWeight;

    return `
    <section class="panel">
        ${multiSeriesChart({
            labels,
            title: 'Waga ciała w czasie',
            series: [
                { points: weights.map((entry, index) => ({ index, value: entry.weight })), color: 'var(--text-dim)', dots: true, line: false },
                { points: averages.map((point, index) => ({ index, value: point.value })), color: 'var(--compound)' }
            ],
            refLines: [
                { value: target + 2, color: 'var(--cardio)', label: `${target + 2} kg` },
                { value: target, color: 'var(--success)', label: `${target} kg` }
            ]
        })}
        <p class="chart-caption">Szare punkty to pomiary dzienne, niebieska linia to średnia
            ${AVERAGE_WINDOW_DAYS}-dniowa. Trend czytaj z linii, nie z punktów.</p>
        ${renderProjection(weights, settings)}
    </section>`;
}

/* ---------- Projekcja ---------- */

function formatDate(key) {
    return key.split('-').reverse().join('.');
}

function renderProjection(weights, settings) {
    const projection = projectTarget(weights, settings.targetWeight);
    if (!projection) return '';

    const { trend, remaining, reached, eta, daysLeft } = projection;
    const pace = trend.perWeek === 0
        ? 'stoi w miejscu'
        : `${trend.perWeek > 0 ? '+' : ''}${trend.perWeek} kg/tydz.`;

    if (reached) {
        return `<p class="projection">Cel ${settings.targetWeight} kg osiągnięty.
            Tempo z ostatnich ${trend.days} dni: <strong>${pace}</strong>.</p>`;
    }

    if (!eta) {
        return `<p class="projection">Tempo z ostatnich ${trend.days} dni: <strong>${pace}</strong>.
            Przy tym trendzie waga nie schodzi — daty celu nie ma sensu liczyć.</p>`;
    }

    return `<p class="projection">
        Tempo: <strong>${pace}</strong> · zostało ${remaining} kg ·
        cel ${settings.targetWeight} kg ok. <strong>${formatDate(eta)}</strong> (za ${daysLeft} dni).
    </p>`;
}

/* ---------- Cele ---------- */

function renderGoals(settings) {
    const tiles = MACROS.map(macro => `
        <label class="macro">
            <span class="macro__label">${escapeHtml(macro.label)}</span>
            <span class="macro__field">
                <input class="macro__input" type="text" inputmode="numeric" data-setting="macro"
                    data-key="${macro.key}" value="${settings.macros[macro.key]}" aria-label="${escapeHtml(macro.label)}">
                <span class="macro__unit">${macro.unit}</span>
            </span>
        </label>`).join('');

    return `
    <section class="panel">
        <h2 class="panel__title">Cele</h2>
        <label class="macro macro--wide">
            <span class="macro__label">Waga docelowa</span>
            <span class="macro__field">
                <input class="macro__input" type="text" inputmode="decimal" data-setting="targetWeight"
                    value="${settings.targetWeight}" aria-label="Waga docelowa">
                <span class="macro__unit">kg</span>
            </span>
        </label>
        <div class="macros">${tiles}</div>
        <p class="panel__hint">Zmiana zapisuje się po wyjściu z pola. Waga docelowa wyznacza obie linie
            na wykresie — drugą o 2 kg wyżej, jako etap pośredni.</p>
    </section>`;
}

/* ---------- Zdarzenia ---------- */

/* Zapis na 'change', a nie na 'input': przy wpisywaniu „78.4” pole po pierwszym
   znaku miałoby wartość 7, a to trafiłoby do historii jako pomiar. */
function handleChange(event) {
    const target = event.target;

    if (target.id === 'diet-date') {
        selectedDate = target.value;
        return remount(target);
    }

    if (target.id === 'diet-weight') {
        const weight = parseNumber(target.value);
        if (weight == null) return;

        saveWeight(selectedDate, weight);
        return remount(target);
    }

    if (target.dataset.setting === 'macro') {
        const value = parseNumber(target.value);
        if (value == null) return;

        saveSettings({ macros: { ...getSettings().macros, [target.dataset.key]: value } });
        return remount(target);
    }

    if (target.dataset.setting === 'targetWeight') {
        const value = parseNumber(target.value);
        if (value == null) return;

        saveSettings({ targetWeight: value });
        remount(target);
    }
}

function remount(element) {
    mountDiet(element.closest('.view'));
}

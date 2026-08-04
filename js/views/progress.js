/* Widok PROGRESJA — wykres 1RM lub objętości, rekordy, objętość per partia
   i kalendarz sesji. */

import { escapeHtml, shortDate, weekStartKey, dateKey } from '../utils.js';
import { getSessions } from '../store.js';
import { MUSCLE_LABELS, WEEKLY_SETS_TARGET } from '../data/muscles.js';
import {
    exercisesWithHistory, oneRepMaxSeries, weeklyVolumeSeries,
    personalRecords, weeklySetsByMuscle, sessionCalendar
} from '../stats.js';
import { lineChart, barChart, calendarHeatmap } from '../chart.js';

const MODES = { E1RM: 'e1rm', VOLUME: 'volume' };
const METER_SCALE = 25;              // górna granica skali wykresu serii

let selectedExercise = null;
let mode = MODES.E1RM;

export function mountProgress(container) {
    container.innerHTML = render();

    if (container.dataset.mounted) return;
    container.addEventListener('change', handleChange);
    container.addEventListener('click', handleClick);
    container.dataset.mounted = '1';
}

function render() {
    const sessions = getSessions();
    const exercises = exercisesWithHistory(sessions);

    if (!exercises.length) {
        return `
        <h1 class="view__title">Progresja</h1>
        <div class="empty">
            <strong>Brak danych</strong>
            Wykresy i rekordy pojawią się, gdy zapiszesz pierwsze serie w logu.
        </div>
        ${renderCalendar(sessions)}`;
    }

    /* Wybór z poprzedniego wejścia zostaje, o ile ćwiczenie nadal ma historię. */
    if (!exercises.some(exercise => exercise.id === selectedExercise)) {
        selectedExercise = exercises[0].id;
    }

    return `
    <h1 class="view__title">Progresja</h1>
    <section class="panel">
        <select class="field__input" id="progress-exercise" aria-label="Ćwiczenie">
            ${exercises.map(exercise => `
                <option value="${escapeHtml(exercise.id)}"${exercise.id === selectedExercise ? ' selected' : ''}>
                    ${escapeHtml(exercise.name)}
                </option>`).join('')}
        </select>
        <div class="chips chips--spread">
            <button class="chip js-mode${mode === MODES.E1RM ? ' is-active' : ''}" type="button" data-mode="e1rm">1RM</button>
            <button class="chip js-mode${mode === MODES.VOLUME ? ' is-active' : ''}" type="button" data-mode="volume">Objętość</button>
        </div>
        <div id="progress-chart">${renderChart(sessions)}</div>
    </section>
    ${renderMuscles(sessions)}
    ${renderRecords(sessions)}
    ${renderCalendar(sessions)}`;
}

/* ---------- Wykres ---------- */

function renderChart(sessions) {
    if (mode === MODES.VOLUME) {
        const points = weeklyVolumeSeries(selectedExercise, sessions);
        return barChart(points, { title: 'Objętość tygodniowa' })
            + '<p class="chart-caption">Serie × powtórzenia × ciężar, sumowane w tygodniach (z dropsetami).</p>';
    }

    const points = oneRepMaxSeries(selectedExercise, sessions);
    const last = points.at(-1);

    return lineChart(points, { title: 'Estymowany rekord jednego powtórzenia' })
        + `<p class="chart-caption">Epley: ciężar × (1 + powt. / 30), z najlepszej serii w sesji.${
            last ? ` Ostatnio: <strong>${last.value} kg</strong> (${shortDate(last.label)}).` : ''}</p>`;
}

/* ---------- Objętość per partia ---------- */

function renderMuscles(sessions) {
    const week = weekStartKey(dateKey());
    const totals = weeklySetsByMuscle(sessions, week);

    const rows = Object.entries(MUSCLE_LABELS).map(([key, label]) => {
        const sets = totals[key] ?? 0;
        const inRange = sets >= WEEKLY_SETS_TARGET.min && sets <= WEEKLY_SETS_TARGET.max;
        const width = Math.min((sets / METER_SCALE) * 100, 100);

        return `
        <div class="meter">
            <div class="meter__head">
                <span>${escapeHtml(label)}</span>
                <span class="meter__value">${sets} ${sets === 1 ? 'seria' : 'serii'}</span>
            </div>
            <div class="meter__track">
                <div class="meter__zone"></div>
                <div class="meter__fill${inRange ? ' is-ok' : ''}" style="width: ${width}%"></div>
            </div>
        </div>`;
    }).join('');

    return `
    <section class="panel">
        <h2 class="panel__title">Objętość tego tygodnia</h2>
        <p class="panel__hint">Cel: ${WEEKLY_SETS_TARGET.min}–${WEEKLY_SETS_TARGET.max} serii na partię (jasny pas).
            Seria liczy się 1.0 dla partii głównej i 0.5 dla wspomagającej.</p>
        ${rows}
    </section>`;
}

/* ---------- Rekordy ---------- */

function renderRecords(sessions) {
    const records = personalRecords(sessions);
    if (!records.length) return '';

    return `
    <section class="panel">
        <h2 class="panel__title">Rekordy</h2>
        <table class="table">
            <thead>
                <tr><th>Ćwiczenie</th><th>Wynik</th><th>1RM</th><th>Data</th></tr>
            </thead>
            <tbody>
                ${records.map(record => `
                <tr>
                    <td>${escapeHtml(record.name)}</td>
                    <td class="table__num">${record.weight} × ${record.reps}</td>
                    <td class="table__num">${record.e1rm} kg</td>
                    <td class="table__num">${shortDate(record.date)}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </section>`;
}

/* ---------- Kalendarz ---------- */

function renderCalendar(sessions) {
    return `
    <section class="panel">
        <h2 class="panel__title">Ostatnie 12 tygodni</h2>
        ${calendarHeatmap(sessionCalendar(sessions, 12))}
        <div class="legend">
            <span class="legend__item"><i class="legend__dot" style="background: var(--compound)"></i>siłowa</span>
            <span class="legend__item"><i class="legend__dot" style="background: var(--combat)"></i>combat</span>
            <span class="legend__item"><i class="legend__dot" style="background: var(--surface-2)"></i>wolne</span>
        </div>
    </section>`;
}

/* ---------- Zdarzenia ---------- */

/* Przerysowujemy sam wykres, a nie cały widok — pełny re-render zwijałby
   otwartą listę selecta w trakcie wyboru. */
function refreshChart() {
    const target = document.getElementById('progress-chart');
    if (target) target.innerHTML = renderChart(getSessions());
}

function handleChange(event) {
    if (event.target.id !== 'progress-exercise') return;

    selectedExercise = event.target.value;
    refreshChart();
}

function handleClick(event) {
    const button = event.target.closest('.js-mode');
    if (!button) return;

    mode = button.dataset.mode;
    button.closest('.chips').querySelectorAll('.js-mode').forEach(chip => {
        chip.classList.toggle('is-active', chip === button);
    });
    refreshChart();
}

/* Widok LOG — zapis sesji treningowej.

   Renderowanie jest ziarniste: wpisywanie do inputów tylko aktualizuje model
   i odpala autosave, a przerysowujemy najwyżej jedną kartę ćwiczenia. Pełny
   re-render przy każdym znaku zabierałby fokus w trakcie pisania. */

import { dateKey, escapeHtml, parseDateKey, parseNumber, planDayIndex } from '../utils.js';
import {
    getPlan, getSessions, getSession, getSessionIds,
    saveSession, deleteSession, getLatestWeight, getSettings
} from '../store.js';
import { buildSessionForDay, buildExtraSet, SESSION_TYPES } from '../data/session.js';
import { suggestNext, formatLast, formatSuggestion } from '../progression.js';
import { bestE1RM, markRecords } from '../stats.js';
import { createRestTimer, formatClock, REST_PRESETS } from '../timer.js';

const SAVE_DEBOUNCE_MS = 500;

let root = null;
let selectedDate = dateKey();
let session = null;
let suggestions = {};        // id ćwiczenia → sugestia z silnika progresji
let saveHandle = null;
let pendingSession = null;
let timer = null;

export function mountLog(container) {
    root = container;
    loadDate(selectedDate);

    if (root.dataset.mounted) return;
    root.addEventListener('click', handleClick);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleChange);

    /* iOS potrafi ubić PWA w tle bez ostrzeżenia — niedokończony debounce
       zabrałby ze sobą ostatnią wpisaną serię. */
    window.addEventListener('pagehide', flushSave);
    root.dataset.mounted = '1';
}

/* ---------- Ładowanie ---------- */

function planDayFor(date) {
    return getPlan().days[planDayIndex(parseDateKey(date))];
}

function loadDate(date) {
    flushSave();                 // zmiana dnia nie może zgubić niezapisanych zmian
    selectedDate = date;
    session = getSession(date);
    suggestions = session && session.type === SESSION_TYPES.STRENGTH ? buildSuggestions() : {};
    render();
}

/* Sugestie liczymy z historii BEZ bieżącej sesji — inaczej dzisiejsze wpisy
   podnosiłyby własną sugestię w trakcie treningu. */
function buildSuggestions() {
    const history = getSessions().filter(item => item.id !== session.id);
    const bodyweightKg = getLatestWeight();
    const day = planDayFor(selectedDate);
    const result = {};

    for (const exercise of day.exercises) {
        result[exercise.id] = {
            ...suggestNext(exercise, history, { bodyweightKg }),
            exercise,
            bodyweightKg,
            /* Rekord sprzed dzisiejszej sesji — do oznaczania nowego PR w wierszu. */
            best1RM: bestE1RM(exercise.id, history)
        };
    }
    return result;
}

/* ---------- Render ---------- */

function render() {
    const day = planDayFor(selectedDate);

    root.innerHTML = `
    <div class="log-bar">
        <input class="log-bar__date" type="date" id="log-date" value="${selectedDate}" aria-label="Data sesji">
        <span class="log-bar__status" id="log-status"></span>
    </div>
    ${session ? renderSession(day) : renderStart(day)}`;
}

function renderStart(day) {
    return `
    <div class="empty">
        <strong>${escapeHtml(day.day)} — ${escapeHtml(day.type)}</strong>
        Brak zapisanej sesji na ten dzień.
    </div>
    <div class="start-actions">
        <button class="btn btn--primary js-start" type="button" data-type="strength">Sesja siłowa</button>
        <button class="btn js-start" type="button" data-type="combat">Sesja combat</button>
    </div>`;
}

function renderSession(day) {
    const body = session.type === SESSION_TYPES.COMBAT ? renderCombat() : renderStrength();

    return `
    <div class="session-head">
        <h1 class="view__title">${escapeHtml(day.day)} — ${escapeHtml(day.type)}</h1>
        <button class="btn btn--ghost js-delete" type="button">Usuń</button>
    </div>
    ${body}
    <label class="field">
        <span class="field__label">Notatka do sesji</span>
        <textarea class="field__input" rows="2" data-field="sessionNote"
            placeholder="Jak poszło?">${escapeHtml(session.note ?? '')}</textarea>
    </label>`;
}

/* ---------- Sesja siłowa ---------- */

function renderStrength() {
    if (!session.exercises.length) {
        return '<div class="empty">Ten dzień nie ma ćwiczeń w planie.</div>';
    }
    return session.exercises.map(renderExerciseCard).join('') + renderRestTimer();
}

/* Timer wisi nad tab barem zamiast siedzieć w nagłówku logu: między seriami
   jesteś w połowie listy ćwiczeń i przewijanie na górę po każdej serii
   nie miało sensu. */
function renderRestTimer() {
    const preferred = getSettings().restTimerSec;
    const presets = REST_PRESETS.map(seconds => `
        <button class="chip js-timer${seconds === preferred ? ' is-active' : ''}" type="button"
            data-sec="${seconds}">${seconds}s</button>`).join('');

    return `
    <div class="rest-timer" id="rest-timer">
        <div class="rest-timer__presets">
            ${presets}
            <button class="chip js-timer-stop" type="button">Stop</button>
        </div>
        <button class="rest-timer__toggle js-timer-toggle" type="button" aria-expanded="false"
            aria-label="Timer odpoczynku">
            <span id="timer-display">Timer</span>
        </button>
    </div>`;
}

function renderExerciseCard(entry) {
    const suggestion = suggestions[entry.id];
    const last = suggestion ? formatLast(suggestion.last) : null;
    const hint = suggestion
        ? `sugestia: ${formatSuggestion(suggestion, suggestion.exercise, suggestion.bodyweightKg)}`
        : '';
    /* Wskazówka techniczna pochodzi z planu, nie z sesji — sesja przechowuje
       tylko to, co zmienne, a technika jest opisem ćwiczenia. */
    const technique = suggestion?.exercise?.technique;

    return `
    <section class="ex-card" data-exercise-id="${escapeHtml(entry.id)}">
        <div class="ex-card__head">
            <span class="exercise__name">${escapeHtml(entry.name)}</span>
            <span class="tag tag--${escapeHtml(entry.tag)}">${escapeHtml(entry.tag)}</span>
        </div>
        <p class="exercise__micro">${hint}${last ? ` · ostatnio: ${last}` : ''}</p>
        ${technique ? `<p class="exercise__note">${escapeHtml(technique)}</p>` : ''}
        ${suggestion?.stagnant ? '<p class="hint">Stagnacja — rozważ deload 55%.</p>' : ''}
        ${renderSets(entry, suggestion)}
        <div class="ex-card__foot">
            <button class="btn btn--small js-add-set" type="button">+ Seria</button>
            <input class="field__input field__input--inline" type="text" data-field="exerciseNote"
                placeholder="Notatka do ćwiczenia" value="${escapeHtml(entry.note ?? '')}">
        </div>
    </section>`;
}

function renderSets(entry, suggestion) {
    const records = markRecords(entry.sets, suggestion?.best1RM ?? 0);
    return entry.sets.map((set, index) => renderSet(set, index, entry, records[index])).join('');
}

function renderSet(set, index, entry, record) {
    const repsPlaceholder = entry.unit === 'sek' ? `${set.plannedReps ?? ''} s` : (set.plannedReps ?? '');

    return `
    <div class="set${set.done ? ' is-done' : ''}" data-index="${index}">
        <div class="set__main">
            <span class="set__no">${index + 1}</span>
            <input class="set__input" type="text" inputmode="decimal" data-field="weight"
                placeholder="${set.plannedWeight ?? ''}" value="${set.weight ?? ''}" aria-label="Ciężar">
            <span class="set__x">×</span>
            <input class="set__input" type="text" inputmode="numeric" data-field="reps"
                placeholder="${repsPlaceholder}" value="${set.reps ?? ''}" aria-label="Powtórzenia">
            <button class="set__btn js-copy" type="button" title="Jak poprzednia seria"
                aria-label="Skopiuj ciężar i powtórzenia z poprzedniej serii"${index === 0 ? ' disabled' : ''}>↓</button>
            <button class="set__btn js-dropset${set.dropset ? ' is-active' : ''}" type="button"
                aria-pressed="${Boolean(set.dropset)}" title="Dropset">D</button>
            <button class="set__btn set__btn--done js-done" type="button"
                aria-pressed="${set.done}" title="Wykonane">✓</button>
        </div>
        ${set.dropset ? renderDropset(set.dropset) : ''}
        ${record.isRecord ? `<div class="set__pr">PR — nowy rekord (${Math.round(record.estimated * 10) / 10} kg 1RM)</div>` : ''}
    </div>`;
}

function renderDropset(dropset) {
    return `
    <div class="set__drop">
        <span class="set__no">drop</span>
        <input class="set__input" type="text" inputmode="decimal" data-field="dropWeight"
            value="${dropset.weight ?? ''}" placeholder="kg" aria-label="Ciężar dropsetu">
        <span class="set__x">×</span>
        <input class="set__input" type="text" inputmode="numeric" data-field="dropReps"
            value="${dropset.reps ?? ''}" placeholder="powt." aria-label="Powtórzenia dropsetu">
    </div>`;
}

/* ---------- Sesja combat ---------- */

function renderCombat() {
    const chip = (field, value, label) => `
        <button class="chip${String(session[field]) === String(value) ? ' is-active' : ''} js-chip"
            type="button" data-field="${field}" data-value="${value}">${label}</button>`;

    return `
    <div class="field">
        <span class="field__label">Dyscyplina</span>
        <div class="chips">
            ${chip('discipline', 'boks', 'Boks')}
            ${chip('discipline', 'kickboxing', 'Kickboxing')}
        </div>
    </div>
    <label class="field">
        <span class="field__label">Czas trwania (min)</span>
        <input class="field__input" type="text" inputmode="numeric" data-field="durationMin"
            value="${session.durationMin ?? ''}" placeholder="90">
    </label>
    <div class="field">
        <span class="field__label">Samopoczucie</span>
        <div class="chips">
            ${[1, 2, 3, 4, 5].map(value => chip('rating', value, value)).join('')}
        </div>
    </div>`;
}

/* ---------- Zapis ---------- */

function setStatus(text) {
    const element = document.getElementById('log-status');
    if (element) element.textContent = text;
}

/* Sesję do zapisu zapamiętujemy osobno: gdy w trakcie debounce zmieni się dzień,
   zapisać trzeba tę edytowaną, a nie tę właśnie wczytaną. */
function scheduleSave() {
    pendingSession = session;
    setStatus('Zapisywanie…');
    clearTimeout(saveHandle);
    saveHandle = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
}

function flushSave() {
    clearTimeout(saveHandle);
    saveHandle = null;
    if (!pendingSession) return;

    saveSession(pendingSession);
    pendingSession = null;
    setStatus('Zapisano');
}

/* ---------- Zdarzenia ---------- */

function entryFrom(element) {
    const card = element.closest('[data-exercise-id]');
    return card ? session.exercises.find(item => item.id === card.dataset.exerciseId) : null;
}

function setFrom(element, entry) {
    const row = element.closest('[data-index]');
    return row ? entry.sets[Number(row.dataset.index)] : null;
}

function refreshExercise(exerciseId) {
    const card = root.querySelector(`[data-exercise-id="${exerciseId}"]`);
    const entry = session.exercises.find(item => item.id === exerciseId);
    if (card && entry) card.outerHTML = renderExerciseCard(entry);
}

function handleInput(event) {
    const field = event.target.dataset.field;
    if (!field || !session) return;

    const value = event.target.value;

    if (field === 'sessionNote') {
        session.note = value;
    } else if (field === 'durationMin') {
        session.durationMin = parseNumber(value);
    } else if (field === 'exerciseNote') {
        const entry = entryFrom(event.target);
        if (entry) entry.note = value;
    } else {
        const entry = entryFrom(event.target);
        const set = entry && setFrom(event.target, entry);
        if (!set) return;

        if (field === 'weight') set.weight = parseNumber(value);
        if (field === 'reps') set.reps = roundReps(parseNumber(value));
        if (field === 'dropWeight' && set.dropset) set.dropset.weight = parseNumber(value);
        if (field === 'dropReps' && set.dropset) set.dropset.reps = roundReps(parseNumber(value));
    }

    scheduleSave();
}

function roundReps(value) {
    return value == null ? null : Math.round(value);
}

function handleChange(event) {
    if (event.target.id === 'log-date') loadDate(event.target.value);
}

function handleClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.classList.contains('js-start')) return startSession(button.dataset.type);
    if (button.classList.contains('js-delete')) return removeSession();
    if (button.classList.contains('js-timer-toggle')) return toggleTimerPanel(button);
    if (button.classList.contains('js-timer')) return startTimer(Number(button.dataset.sec), button);
    if (button.classList.contains('js-timer-stop')) return timer?.stop();
    if (button.classList.contains('js-copy')) return copyPreviousSet(button);
    if (button.classList.contains('js-chip')) return selectChip(button);
    if (button.classList.contains('js-dropset')) return toggleDropset(button);
    if (button.classList.contains('js-done')) return toggleDone(button);
    if (button.classList.contains('js-add-set')) return addSet(button);
}

function startSession(type) {
    const day = planDayFor(selectedDate);
    const bodyweightKg = getLatestWeight();
    const history = getSessions();

    /* Dzień z planu może być bokserski, a użytkownik i tak chce zapisać siłową
       (albo odwrotnie) — o kształcie sesji decyduje wybrany przycisk. */
    const forcedDay = { ...day, isCombat: type === SESSION_TYPES.COMBAT };

    session = buildSessionForDay(forcedDay, {
        date: selectedDate,
        planVersion: getPlan().version,
        bodyweightKg,
        existingIds: getSessionIds(),
        suggest: exercise => suggestNext(exercise, history, { bodyweightKg })
    });

    saveSession(session);
    suggestions = session.type === SESSION_TYPES.STRENGTH ? buildSuggestions() : {};
    render();
    setStatus('Zapisano');
}

function removeSession() {
    if (!confirm('Usunąć całą sesję z tego dnia?')) return;

    /* Kolejka zapisu musi zniknąć razem z sesją, inaczej debounce wskrzesi ją
       pół sekundy po usunięciu. */
    clearTimeout(saveHandle);
    saveHandle = null;
    pendingSession = null;

    deleteSession(session.id);
    session = null;
    timer?.stop();
    render();
}

function toggleDropset(button) {
    const entry = entryFrom(button);
    const set = setFrom(button, entry);

    /* Zamknięty dropset to null, nie pusty obiekt — inaczej wykresy i eksport
       widziałyby dropset, którego nie było. */
    set.dropset = set.dropset ? null : { weight: null, reps: null };

    refreshExercise(entry.id);
    scheduleSave();
}

function toggleDone(button) {
    const entry = entryFrom(button);
    const set = setFrom(button, entry);
    set.done = !set.done;

    /* Odhaczenie pustej serii = potwierdzenie sugestii. Bez tego trzeba by
       przepisywać ręcznie to, co i tak jest na szaro w placeholderze. */
    if (set.done && set.weight == null && set.reps == null) {
        set.weight = set.plannedWeight;
        set.reps = set.plannedReps;
    }

    refreshExercise(entry.id);
    scheduleSave();
}

/* Przepisuje wynik z poprzedniej serii. Gdy poprzednia nie ma jeszcze wpisanych
   wartości, bierzemy jej sugestię — i tak jest tym, co widać na szaro. */
function copyPreviousSet(button) {
    const entry = entryFrom(button);
    const index = Number(button.closest('[data-index]').dataset.index);
    if (index === 0) return;

    const previous = entry.sets[index - 1];
    const set = entry.sets[index];
    set.weight = previous.weight ?? previous.plannedWeight;
    set.reps = previous.reps ?? previous.plannedReps;

    refreshExercise(entry.id);
    scheduleSave();
}

function addSet(button) {
    const entry = entryFrom(button);
    entry.sets.push(buildExtraSet(entry.sets.at(-1)));

    refreshExercise(entry.id);
    scheduleSave();
}

function selectChip(button) {
    const { field, value } = button.dataset;
    session[field] = field === 'rating' ? Number(value) : value;

    button.closest('.chips').querySelectorAll('.js-chip').forEach(chip => {
        chip.classList.toggle('is-active', chip === button);
    });
    scheduleSave();
}

function toggleTimerPanel(button) {
    const panel = button.closest('.rest-timer');
    const isOpen = panel.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
}

function startTimer(seconds, button) {
    const panel = button.closest('.rest-timer');
    const toggle = () => document.querySelector('.rest-timer__toggle');
    const display = () => document.getElementById('timer-display');

    panel.querySelectorAll('.js-timer').forEach(chip => {
        chip.classList.toggle('is-active', chip === button);
    });

    timer ??= createRestTimer({
        onTick: remaining => {
            const element = display();
            /* null = timer stoi; wtedy pigułka wraca do etykiety zamiast myślnika. */
            if (element) element.textContent = remaining == null ? 'Timer' : formatClock(remaining);
            toggle()?.classList.toggle('is-running', remaining != null);
        },
        onFinish: () => {
            const element = toggle();
            if (!element) return;

            element.classList.add('is-finished');
            setTimeout(() => toggle()?.classList.remove('is-finished'), 5000);
        }
    });

    timer.start(seconds);
    panel.classList.remove('is-open');
    panel.querySelector('.js-timer-toggle').setAttribute('aria-expanded', 'false');
}

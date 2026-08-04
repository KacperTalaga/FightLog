/* Widok PLAN — rozwijalne karty dni tygodnia. */

import { escapeHtml, planDayIndex } from '../utils.js';
import { getPlan } from '../store.js';

const CHEVRON = `<svg class="day-card__chevron" viewBox="0 0 24 24" width="16" height="16" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="9 6 15 12 9 18"></polyline></svg>`;

export function mountPlan(container) {
    container.innerHTML = renderPlan();
    container.addEventListener('click', handleDayToggle);
}

function renderPlan() {
    const todayIndex = planDayIndex();
    const days = getPlan().days.map((day, index) => renderDay(day, index === todayIndex)).join('');
    return `<h1 class="view__title">Plan tygodnia</h1>${days}`;
}

function renderDay(day, isToday) {
    const classes = ['day-card'];
    if (isToday) classes.push('is-today', 'is-open');

    return `
    <article class="${classes.join(' ')}">
        <button class="day-card__header" type="button" aria-expanded="${isToday}">
            <span class="day-card__icon" aria-hidden="true">${day.icon}</span>
            <span class="day-card__titles">
                <span class="day-card__day">${escapeHtml(day.day)}</span>
                <span class="day-card__type">${escapeHtml(day.type)}</span>
            </span>
            ${isToday ? '<span class="badge-today">Dziś</span>' : ''}
            ${CHEVRON}
        </button>
        <div class="day-card__body">
            <p class="day-card__note">${escapeHtml(day.note)}</p>
            ${day.exercises.map(renderExercise).join('')}
            ${day.finisher ? renderFinisher(day.finisher) : ''}
        </div>
    </article>`;
}

/* „4 × 6–10 / str”, „3 × 15”, „3 × 10 sek / str” */
export function formatVolume(exercise) {
    const [min, max] = exercise.repRange;
    const range = min === max ? `${min}` : `${min}–${max}`;
    const unit = exercise.unit === 'sek' ? ' sek' : '';
    const side = exercise.perSide ? ' / str' : '';
    return `${exercise.sets} × ${range}${unit}${side}`;
}

/* „70 kg”, „BW”, „BW +5 kg”, „Dobierz” */
export function formatStartWeight(exercise) {
    if (exercise.bodyweight) {
        return exercise.startWeight ? `BW +${exercise.startWeight} kg` : 'BW';
    }
    return exercise.startWeight == null ? 'Dobierz' : `${exercise.startWeight} kg`;
}

function renderExercise(exercise) {
    return `
    <div class="exercise" data-exercise-id="${escapeHtml(exercise.id)}">
        <div class="exercise__top">
            <span class="exercise__name">${escapeHtml(exercise.name)}</span>
            <span class="tag tag--${escapeHtml(exercise.tag)}">${escapeHtml(exercise.tag)}</span>
        </div>
        <div class="exercise__stats">
            <div>
                <div class="exercise__label">Serie</div>
                <div class="exercise__value">${formatVolume(exercise)}</div>
            </div>
            <div>
                <div class="exercise__label">Ciężar</div>
                <div class="exercise__value">${formatStartWeight(exercise)}</div>
            </div>
            <div>
                <div class="exercise__label">Przyrost</div>
                <div class="exercise__value">+${exercise.increment} kg</div>
            </div>
        </div>
        <p class="exercise__note">${escapeHtml(exercise.technique)}</p>
    </div>`;
}

function renderFinisher(finisher) {
    return `
    <div class="exercise exercise--finisher">
        <div class="exercise__top">
            <span class="exercise__name">${escapeHtml(finisher.name)}</span>
            <span class="tag tag--${escapeHtml(finisher.tag)}">finisher</span>
        </div>
        <div class="exercise__stats">
            <div>
                <div class="exercise__label">Protokół</div>
                <div class="exercise__value">${escapeHtml(finisher.detail)}</div>
            </div>
        </div>
        <p class="exercise__note">${escapeHtml(finisher.technique)}</p>
    </div>`;
}

function handleDayToggle(event) {
    const header = event.target.closest('.day-card__header');
    if (!header) return;

    const card = header.closest('.day-card');
    const isOpen = card.classList.toggle('is-open');
    header.setAttribute('aria-expanded', String(isOpen));
}

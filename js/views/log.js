/* Widok LOG — logowanie sesji. Właściwy formularz powstaje w kolejnych etapach
   przebudowy (model danych → silnik progresji → log). Na razie widok pokazuje,
   co jest zaplanowane na dziś. */

import { dateKey, escapeHtml, planDayIndex } from '../utils.js';
import { getPlan } from '../store.js';

export function mountLog(container) {
    const day = getPlan().days[planDayIndex()];

    container.innerHTML = `
    <h1 class="view__title">Log</h1>
    <div class="empty">
        <strong>${escapeHtml(day.day)} — ${escapeHtml(day.type)}</strong>
        ${dateKey()}<br>
        Logowanie sesji podpinamy w kolejnym etapie przebudowy.
    </div>`;
}

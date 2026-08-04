/* Obliczenia wokół wagi ciała. Funkcje czyste — wpisy wchodzą argumentem. */

import { parseDateKey } from './utils.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const AVERAGE_WINDOW_DAYS = 7;
export const STALL_WINDOW_DAYS = 21;
export const KCAL_CUT = 100;

function sortByDate(weights) {
    return [...weights].sort((a, b) => a.date.localeCompare(b.date));
}

/* Średnia krocząca po oknie kalendarzowym, nie po liczbie wpisów. Przy przerwie
   w ważeniu okno „7 ostatnich pomiarów” obejmowałoby dwa tygodnie i wygładzało
   wykres w złym miejscu. */
export function movingAverage(weights, windowDays = AVERAGE_WINDOW_DAYS) {
    const sorted = sortByDate(weights);

    return sorted.map(entry => {
        const end = parseDateKey(entry.date).getTime();
        const start = end - (windowDays - 1) * DAY_MS;

        const window = sorted.filter(item => {
            const time = parseDateKey(item.date).getTime();
            return time >= start && time <= end;
        });

        const sum = window.reduce((total, item) => total + item.weight, 0);
        return { label: entry.date, value: Math.round((sum / window.length) * 100) / 100 };
    });
}

/**
 * Czy średnia krocząca stoi w miejscu od `days` dni.
 * @returns null gdy historia jest za krótka, żeby cokolwiek stwierdzić
 */
export function stallInfo(weights, days = STALL_WINDOW_DAYS) {
    if (weights.length < 2) return null;

    const averages = movingAverage(weights);
    const last = averages.at(-1);
    const cutoff = parseDateKey(last.label).getTime() - days * DAY_MS;

    const past = averages.filter(point => parseDateKey(point.label).getTime() <= cutoff).at(-1);
    if (!past) return null;

    const delta = Math.round((last.value - past.value) * 100) / 100;
    return { delta, stalled: delta >= 0, from: past.label, to: last.label };
}

export function latestAverage(weights) {
    const averages = movingAverage(weights);
    return averages.length ? averages.at(-1).value : null;
}

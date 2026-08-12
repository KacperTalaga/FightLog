/* Obliczenia wokół wagi ciała. Funkcje czyste — wpisy wchodzą argumentem. */

import { dateKey, parseDateKey } from './utils.js';

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

/* Tempo zmiany wagi: regresja liniowa po punktach średniej kroczącej z ostatnich
   `days` dni. Liczymy z średniej, a nie z surowych pomiarów — pojedynczy dzień
   po pizzy nie może przestawiać prognozy o tydzień. */
export function weightTrend(weights, days = STALL_WINDOW_DAYS) {
    const averages = movingAverage(weights);
    if (averages.length < 2) return null;

    const lastDate = parseDateKey(averages.at(-1).label).getTime();
    const windowStart = lastDate - days * DAY_MS;

    const points = averages
        .filter(point => parseDateKey(point.label).getTime() >= windowStart)
        .map(point => ({
            x: (parseDateKey(point.label).getTime() - windowStart) / DAY_MS,
            y: point.value
        }));

    if (points.length < 2) return null;

    const count = points.length;
    const sumX = points.reduce((total, point) => total + point.x, 0);
    const sumY = points.reduce((total, point) => total + point.y, 0);
    const sumXY = points.reduce((total, point) => total + point.x * point.y, 0);
    const sumXX = points.reduce((total, point) => total + point.x * point.x, 0);

    const denominator = count * sumXX - sumX * sumX;
    if (denominator === 0) return null;                 // wszystkie pomiary z jednego dnia

    const perDay = (count * sumXY - sumX * sumY) / denominator;
    return {
        perDay,
        perWeek: Math.round(perDay * 7 * 100) / 100,
        current: averages.at(-1).value,
        to: averages.at(-1).label,
        days
    };
}

/**
 * Kiedy przy obecnym tempie waga dojdzie do celu.
 * @returns null gdy za mało danych; eta === null gdy trend stoi albo rośnie
 */
export function projectTarget(weights, targetWeight, days = STALL_WINDOW_DAYS) {
    const trend = weightTrend(weights, days);
    if (!trend) return null;

    const remaining = Math.round((trend.current - targetWeight) * 100) / 100;
    if (remaining <= 0) return { trend, remaining, reached: true, eta: null, daysLeft: null };

    /* Ekstrapolujemy wyłącznie spadek. Przy trendzie płaskim albo rosnącym
       „data celu” byłaby liczbą wziętą z sufitu. */
    if (trend.perDay >= 0) return { trend, remaining, reached: false, eta: null, daysLeft: null };

    const daysLeft = Math.ceil(remaining / -trend.perDay);
    const eta = new Date(parseDateKey(trend.to).getTime() + daysLeft * DAY_MS);

    return { trend, remaining, reached: false, eta: dateKey(eta), daysLeft };
}

export function latestAverage(weights) {
    const averages = movingAverage(weights);
    return averages.length ? averages.at(-1).value : null;
}

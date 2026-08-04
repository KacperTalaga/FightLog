/* Wykresy jako inline SVG generowane w JS.

   Bez Chart.js i bez canvasa: SVG działa offline bez cache'owania CDN, jest
   ostry na Retinie w każdym powiększeniu i skaluje się przez viewBox, więc
   jedna szerokość bazowa wystarcza na wszystkie ekrany. */

import { escapeHtml, shortDate } from './utils.js';

const WIDTH = 520;
const PADDING = { top: 14, right: 14, bottom: 26, left: 46 };

function empty(message) {
    return `<p class="chart-empty">${escapeHtml(message)}</p>`;
}

/* Domena z 10% zapasem — punkty przyklejone do krawędzi wyglądają na ucięte. */
function domain(values) {
    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min === max) {
        min -= Math.max(Math.abs(min) * 0.05, 1);
        max += Math.max(Math.abs(max) * 0.05, 1);
    }

    const margin = (max - min) * 0.1;
    return { min: min - margin, max: max + margin };
}

function formatValue(value) {
    return value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(Math.round(value * 10) / 10);
}

function grid(scale, height) {
    const { min, max } = scale;
    const ticks = [min, (min + max) / 2, max];

    return ticks.map(value => {
        const y = scale.y(value);
        return `<line class="chart__grid" x1="${PADDING.left}" y1="${y}" x2="${WIDTH - PADDING.right}" y2="${y}"/>
                <text class="chart__label" x="${PADDING.left - 6}" y="${y + 4}" text-anchor="end">${formatValue(value)}</text>`;
    }).join('');
}

/* Etykiety osi X: pierwsza, środkowa i ostatnia — więcej się nie mieści
   na szerokości telefonu. */
function axisLabels(points, scale, height) {
    const indexes = points.length > 2 ? [0, Math.floor(points.length / 2), points.length - 1] : points.map((_, i) => i);
    const y = height - 6;

    return [...new Set(indexes)].map(index => {
        const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle';
        return `<text class="chart__label" x="${scale.x(index)}" y="${y}" text-anchor="${anchor}">${shortDate(points[index].label)}</text>`;
    }).join('');
}

function makeScale(points, height) {
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = height - PADDING.top - PADDING.bottom;
    const { min, max } = domain(points.map(point => point.value));

    return {
        min,
        max,
        x: index => points.length === 1
            ? PADDING.left + innerWidth / 2
            : Math.round((PADDING.left + (index / (points.length - 1)) * innerWidth) * 10) / 10,
        y: value => Math.round((PADDING.top + innerHeight - ((value - min) / (max - min)) * innerHeight) * 10) / 10
    };
}

function frame(height, body, title) {
    return `<svg class="chart" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="${escapeHtml(title)}">${body}</svg>`;
}

export function lineChart(points, { height = 190, color = 'var(--compound)', title = 'Wykres' } = {}) {
    if (!points.length) return empty('Brak danych — zapisz kilka sesji.');

    const scale = makeScale(points, height);
    const path = points.map((point, index) => `${index ? 'L' : 'M'}${scale.x(index)} ${scale.y(point.value)}`).join(' ');
    const dots = points.map((point, index) =>
        `<circle cx="${scale.x(index)}" cy="${scale.y(point.value)}" r="3" fill="${color}"/>`).join('');

    return frame(height, `
        ${grid(scale, height)}
        <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${dots}
        ${axisLabels(points, scale, height)}`, title);
}

export function barChart(points, { height = 190, color = 'var(--izolacja)', title = 'Wykres' } = {}) {
    if (!points.length) return empty('Brak danych — zapisz kilka sesji.');

    const scale = makeScale(points, height);
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const slot = innerWidth / points.length;
    const barWidth = Math.max(Math.min(slot * 0.6, 28), 4);
    const baseline = height - PADDING.bottom;

    const bars = points.map((point, index) => {
        const x = PADDING.left + slot * index + (slot - barWidth) / 2;
        const y = scale.y(point.value);
        return `<rect x="${Math.round(x * 10) / 10}" y="${y}" width="${barWidth}" height="${Math.max(baseline - y, 1)}" rx="2" fill="${color}"/>`;
    }).join('');

    return frame(height, `${grid(scale, height)}${bars}${axisLabels(points, scale, height)}`, title);
}

/* ---------- Kalendarz-heatmapa ---------- */

const CELL = 11;
const GAP = 3;

export function calendarHeatmap(days, { title = 'Kalendarz sesji' } = {}) {
    if (!days.length) return empty('Brak danych.');

    const columns = Math.ceil(days.length / 7);
    const width = columns * (CELL + GAP);
    const height = 7 * (CELL + GAP);

    const cells = days.map((day, index) => {
        const column = Math.floor(index / 7);
        const row = index % 7;
        const fill = day.type === 'strength' ? 'var(--compound)'
            : day.type === 'combat' ? 'var(--combat)'
            : 'var(--surface-2)';

        return `<rect x="${column * (CELL + GAP)}" y="${row * (CELL + GAP)}" width="${CELL}" height="${CELL}"
            rx="2" fill="${fill}"><title>${day.date}${day.type ? ` — ${day.type}` : ''}</title></rect>`;
    }).join('');

    return `<svg class="chart chart--heatmap" viewBox="0 0 ${width} ${height}" role="img"
        aria-label="${escapeHtml(title)}">${cells}</svg>`;
}

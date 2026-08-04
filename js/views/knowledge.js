/* Widok BAZA WIEDZY — akordeon z wyszukiwarką tekstową.
   Treść jest wbudowana w aplikację, więc działa bez sieci. */

import { escapeHtml, normalizeText } from '../utils.js';
import { KNOWLEDGE } from '../data/knowledge.js';

let query = '';
const openSections = new Set();

export function mountKnowledge(container) {
    container.innerHTML = `
    <h1 class="view__title">Baza wiedzy</h1>
    <input class="field__input" type="search" id="knowledge-search" value="${escapeHtml(query)}"
        placeholder="Szukaj: białko, deload, objętość…" aria-label="Szukaj w bazie wiedzy">
    <div id="knowledge-list">${renderList()}</div>`;

    if (container.dataset.mounted) return;
    container.addEventListener('input', handleSearch);
    container.addEventListener('click', handleToggle);
    container.dataset.mounted = '1';
}

function matches(section, needle) {
    if (!needle) return true;
    return normalizeText(`${section.title} ${section.tags} ${section.body}`).includes(needle);
}

function renderList() {
    const needle = normalizeText(query.trim());
    const found = KNOWLEDGE.filter(section => matches(section, needle));

    if (!found.length) {
        return `<div class="empty"><strong>Nic nie znaleziono</strong>Spróbuj innego słowa.</div>`;
    }

    /* Przy aktywnym szukaniu rozwijamy trafienia — zwinięta lista wyników
       zmuszałaby do klikania w każdą sekcję po kolei. */
    return found.map(section => renderSection(section, Boolean(needle) || openSections.has(section.id))).join('');
}

function renderSection(section, isOpen) {
    return `
    <article class="knowledge${isOpen ? ' is-open' : ''}" data-section-id="${escapeHtml(section.id)}">
        <button class="knowledge__header" type="button" aria-expanded="${isOpen}">
            <span class="knowledge__title">${escapeHtml(section.title)}</span>
            <span class="knowledge__chevron" aria-hidden="true">+</span>
        </button>
        <div class="knowledge__body">${section.body}</div>
    </article>`;
}

function refreshList() {
    const list = document.getElementById('knowledge-list');
    if (list) list.innerHTML = renderList();
}

/* Przerysowujemy samą listę, a nie cały widok — inaczej pole wyszukiwania
   traciłoby fokus po każdym wpisanym znaku. */
function handleSearch(event) {
    if (event.target.id !== 'knowledge-search') return;

    query = event.target.value;
    refreshList();
}

function handleToggle(event) {
    const header = event.target.closest('.knowledge__header');
    if (!header) return;

    const section = header.closest('.knowledge');
    const isOpen = section.classList.toggle('is-open');
    header.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) openSections.add(section.dataset.sectionId);
    else openSections.delete(section.dataset.sectionId);
}

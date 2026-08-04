/* Widok PROGRESJA — wykresy 1RM, objętość, rekordy. */

export function mountProgress(container) {
    container.innerHTML = `
    <h1 class="view__title">Progresja</h1>
    <div class="empty">
        <strong>Brak danych</strong>
        Wykresy 1RM, objętości i tabela rekordów pojawią się,
        gdy zaczniesz zapisywać sesje w logu.
    </div>`;
}

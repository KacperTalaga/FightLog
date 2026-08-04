/* Widok DIETA — waga poranna, średnia krocząca, cele makro. */

export function mountDiet(container) {
    container.innerHTML = `
    <h1 class="view__title">Dieta</h1>
    <div class="empty">
        <strong>Brak wpisów wagi</strong>
        Wykres wagi ze średnią kroczącą i kafelki makro
        podpinamy w kolejnym etapie przebudowy.
    </div>`;
}

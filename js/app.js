/* Punkt wejścia aplikacji: montuje widoki i obsługuje dolną nawigację. */

import { $, $$ } from './utils.js';
import { mountPlan } from './views/plan.js';
import { mountLog } from './views/log.js';
import { mountProgress } from './views/progress.js';
import { mountDiet } from './views/diet.js';
import { mountKnowledge } from './views/knowledge.js';

/* Klucz widoku = wartość data-view na przycisku = sufiks id kontenera. */
const VIEWS = {
    plan: mountPlan,
    log: mountLog,
    progress: mountProgress,
    diet: mountDiet,
    knowledge: mountKnowledge
};

function switchView(name) {
    /* Przemontowanie widoku przy wejściu — dane mogły się zmienić w innej
       zakładce (sesja zapisana w logu podnosi sugestie w planie). */
    VIEWS[name]($(`#view-${name}`));

    $$('.tab-bar__btn').forEach(button => {
        button.classList.toggle('is-active', button.dataset.view === name);
        button.setAttribute('aria-current', button.dataset.view === name ? 'page' : 'false');
    });

    $$('.view').forEach(view => {
        view.classList.toggle('is-active', view.id === `view-${name}`);
    });

    window.scrollTo(0, 0);
}

function init() {
    Object.entries(VIEWS).forEach(([name, mount]) => mount($(`#view-${name}`)));

    $$('.tab-bar__btn').forEach(button => {
        button.addEventListener('click', () => switchView(button.dataset.view));
    });
}

/* Skrypt jest modułem, więc wykonuje się po sparsowaniu DOM — bez DOMContentLoaded. */
init();

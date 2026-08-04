/* Krótki komunikat na dole ekranu. Używamy go zamiast console.error tam, gdzie
   użytkownik musi się dowiedzieć, że coś nie wyszło (np. logowanie). */

const DEFAULT_MS = 5000;

export function toast(message, duration = DEFAULT_MS) {
    const element = document.createElement('div');
    element.className = 'toast';
    element.setAttribute('role', 'status');
    element.textContent = message;

    document.body.append(element);
    setTimeout(() => element.remove(), duration);
    return element;
}

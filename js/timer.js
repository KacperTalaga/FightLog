/* Timer odpoczynku między seriami.

   Odliczamy do zera i wibrujemy. navigator.vibrate nie działa w Safari na iOS
   i nigdy nie zadziała — dlatego koniec odliczania musi być widoczny również
   wzrokowo, a nie tylko poprzez wibrację. */

export const REST_PRESETS = [60, 90, 180];

export function createRestTimer({ onTick, onFinish }) {
    let handle = null;
    let remaining = 0;

    function stop() {
        clearInterval(handle);
        handle = null;
        remaining = 0;
        onTick(null);
    }

    function tick() {
        remaining -= 1;
        onTick(remaining);

        if (remaining <= 0) {
            clearInterval(handle);
            handle = null;
            navigator.vibrate?.([200, 100, 200]);
            onFinish();
        }
    }

    function start(seconds) {
        clearInterval(handle);
        remaining = seconds;
        onTick(remaining);
        handle = setInterval(tick, 1000);
    }

    return { start, stop, isRunning: () => handle !== null };
}

export function formatClock(seconds) {
    if (seconds == null) return '—';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

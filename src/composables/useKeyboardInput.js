import { onMounted, onUnmounted } from 'vue';

const COLOR_KEYS = {
    r: 'red',
    b: 'blue',
    y: 'yellow',
    g: 'green',
    p: 'purple',
    o: 'orange',
    c: 'cyan',
    k: 'pink',
};

export function useKeyboardInput({ isActive, availableColors, canSubmit, onColorKey, onSubmit, onRemove, onNavigate, onEscape }) {
    function handleKeydown(e) {
        if (!isActive.value) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'Enter' && canSubmit.value) {
            onSubmit();
            return;
        }

        const color = COLOR_KEYS[e.key.toLowerCase()];
        if (color && availableColors.value.includes(color)) {
            onColorKey(color);
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            onNavigate(e.key === 'ArrowRight' ? 'right' : 'left');
            return;
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
            onRemove();
            return;
        }

        if (e.key === 'Escape') {
            onEscape();
        }
    }

    onMounted(() => document.addEventListener('keydown', handleKeydown));
    onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
}

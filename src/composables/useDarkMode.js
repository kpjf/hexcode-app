import { ref, watch } from 'vue';

export function useDarkMode() {
    const isDark = ref(localStorage.getItem('mastermind-darkMode') !== 'false');

    watch(isDark, (val) => {
        document.documentElement.classList.toggle('dark-mode', val);
        localStorage.setItem('mastermind-darkMode', String(val));
    }, { immediate: true });

    function toggleDarkMode() { isDark.value = !isDark.value; }

    return { isDark, toggleDarkMode };
}

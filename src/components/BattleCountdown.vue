<script setup>
import { useBattleStore } from '../stores/battle.js';
const store = useBattleStore();
</script>

<template>
    <div class="countdown-overlay">
        <p class="countdown-label">Get ready!</p>
        <div class="countdown-number">{{ store.countdown }}</div>
        <p class="countdown-hint">Same code for everyone. First to crack it wins.</p>
    </div>
</template>

<style scoped>
.countdown-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 300;
    gap: 12px;
}

.countdown-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95em;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.countdown-number {
    font-size: 7em;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    font-family: "Archivo Black", sans-serif;
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.85; }
}

.countdown-hint {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85em;
    margin: 0;
    max-width: 22ch;
    text-align: center;
}
</style>

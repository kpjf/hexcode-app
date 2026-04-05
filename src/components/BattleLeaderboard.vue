<script setup>
import { ref, computed } from 'vue';
import { useBattleStore } from '../stores/battle.js';
import { useBattleSocket } from '../composables/useBattleSocket.js';
import AppButton from './AppButton.vue';

const emit = defineEmits(['leave']);

const store = useBattleStore();
const socket = useBattleSocket();
const waitingForHost = ref(false);

function formatTime(seconds) {
    if (seconds == null) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

function handleNextBattle() {
    waitingForHost.value = true;
    socket.goAgain();
}

function handleLeave() {
    socket.disconnect();
    emit('leave');
}

const title = computed(() => {
    const winner = store.leaderboard.find((p) => !p.dnf);
    return winner ? `${winner.name} wins!` : 'No one cracked it!';
});
</script>

<template>
    <div class="leaderboard-overlay">
        <div class="leaderboard-dialog">
            <h2 class="leaderboard-title">{{ title }}</h2>
            <p class="round-label">Round {{ store.round }}</p>

            <ul class="leaderboard-list">
                <li
                    v-for="(entry, i) in store.leaderboard"
                    :key="i"
                    class="leaderboard-row"
                    :class="{ 'leaderboard-row--winner': i === 0 && !entry.dnf, 'leaderboard-row--dnf': entry.dnf }"
                >
                    <span class="rank">
                        <template v-if="i === 0 && !entry.dnf">🏆</template>
                        <template v-else-if="!entry.dnf">{{ i + 1 }}</template>
                        <template v-else>—</template>
                    </span>
                    <span class="player-name">{{ entry.name }}</span>
                    <span class="player-time">
                        <template v-if="entry.dnf">DNF</template>
                        <template v-else>{{ formatTime(entry.durationSeconds) }}</template>
                    </span>
                </li>
            </ul>

            <div class="leaderboard-actions">
                <AppButton
                    size="lg"
                    full
                    :disabled="!store.isOwner || waitingForHost"
                    @click="store.isOwner && !waitingForHost && handleNextBattle()"
                >
                    {{ waitingForHost ? 'Starting...' : 'Next Battle' }}
                </AppButton>
                <p v-if="!store.isOwner" class="waiting-hint">Waiting for host to start...</p>

                <AppButton variant="ghost" size="sm" @click="handleLeave">Leave Room</AppButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
.leaderboard-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 16px;
}

.leaderboard-dialog {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 28px 24px;
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
}

.leaderboard-title {
    font-size: 1.5em;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.round-label {
    font-size: 0.8em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin: -8px 0 0;
}

.leaderboard-list {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.leaderboard-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: background 0.15s;
}

.leaderboard-row--winner {
    background: var(--btn-primary-bg);
    border-color: var(--btn-primary-bg);
    color: var(--btn-primary-color);
}

.leaderboard-row--winner .player-name,
.leaderboard-row--winner .player-time,
.leaderboard-row--winner .rank {
    color: var(--btn-primary-color);
}

.leaderboard-row--dnf {
    opacity: 0.5;
}

.rank {
    width: 28px;
    font-weight: 700;
    font-size: 0.9em;
    color: var(--text-secondary);
    text-align: center;
    flex-shrink: 0;
}

.player-name {
    flex: 1;
    font-weight: 600;
    color: var(--text-primary);
    text-align: left;
}

.player-time {
    font-family: monospace;
    font-size: 0.95em;
    font-weight: 600;
    color: var(--text-secondary);
}

.leaderboard-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.waiting-hint {
    color: var(--text-secondary);
    font-size: 0.85em;
    margin: 0;
}
</style>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { useStatsStore } from '../stores/stats.js';
import { loadDailyState } from '../game/useDailyStorage.js';
import IntroScreen from '../components/IntroScreen.vue';

const router = useRouter();
const authStore = useAuthStore();
const statsStore = useStatsStore();

function dailySeed() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const date = dailySeed();

function isModeCompleted(mode) {
    // Check local game state first (fast, covers current device)
    if (loadDailyState(date, mode)?.gameOver) return true;
    // Also check server stats (covers completions from other devices)
    const serverStats = statsStore.stats;
    if (serverStats?.[mode]?.lastRecordedDate === date) return true;
    return false;
}

const completedModes = computed(() => ({
    quick: isModeCompleted('quick'),
    classic: isModeCompleted('classic'),
}));

onMounted(async () => {
    if (authStore.isAuthenticated) {
        await statsStore.fetchStats();
    }
});

function handlePlayDaily(mode) {
    router.push({ path: '/game', query: { type: 'daily', mode } });
}

function handlePlayRandom(mode) {
    router.push({ path: '/game', query: { type: 'random', mode } });
}

function handleStory() {
    router.push('/story');
}
</script>

<template>
    <IntroScreen
        :is-authenticated="authStore.isAuthenticated"
        :completed-modes="completedModes"
        @play-daily="handlePlayDaily"
        @play-random="handlePlayRandom"
        @story="handleStory"
        @login="router.push('/login')"
        @signup="router.push('/signup')"
        @logout="authStore.logout()"
        @stats="router.push('/stats')"
    />
</template>

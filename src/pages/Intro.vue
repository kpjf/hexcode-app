<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { useStatsStore } from '../stores/stats.js';
import { loadDailyState } from '../game/useDailyStorage.js';
import { dailySeed } from '../utils/date.js';
import IntroScreen from '../components/IntroScreen.vue';
import BattleRoomDialog from '../components/BattleRoomDialog.vue';

const router = useRouter();
const authStore = useAuthStore();
const statsStore = useStatsStore();
const showBattleDialog = ref(false);

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

function handleBattleStart() {
    showBattleDialog.value = false;
    router.push({ path: '/game', query: { type: 'battle' } });
}
</script>

<template>
    <IntroScreen
        :is-authenticated="authStore.isAuthenticated"
        :completed-modes="completedModes"
        @play-daily="handlePlayDaily"
        @play-random="handlePlayRandom"
        @story="handleStory"
        @battle="showBattleDialog = true"
        @login="router.push('/login')"
        @signup="router.push('/signup')"
        @logout="authStore.logout()"
        @stats="router.push('/stats')"
    />

    <BattleRoomDialog
        v-if="showBattleDialog"
        @close="showBattleDialog = false"
        @game-start="handleBattleStart"
    />
</template>

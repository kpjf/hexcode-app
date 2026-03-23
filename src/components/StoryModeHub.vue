<script setup>
import { computed, ref, onMounted } from 'vue';
import { STORY_LEVELS, ZONE_DEFS } from '../game/storyLevels.js';
import StoryLevelCard from './StoryLevelCard.vue';

const props = defineProps({
    getLevelState: { type: Function, required: true },
    getStars:      { type: Function, required: true },
    getAttemptsToday: { type: Function, required: true },
    coins:         { type: Number, default: 0 },
});

const emit = defineEmits(['select-level', 'back']);

// ── Layout ─────────────────────────────────────────────────────────────────
const NODE_SIZE   = 64;
const BOSS_SIZE   = 78;
const ZONE_HEIGHT = 900;
const SVG_W       = 360;

// Winding path: 10 nodes per zone, alternating left/center/right
const LAYOUT = [
    { cx: 270, cy:  70 },  // 1  right
    { cx:  90, cy: 155 },  // 2  left
    { cx: 270, cy: 240 },  // 3  right
    { cx:  90, cy: 325 },  // 4  left
    { cx: 200, cy: 415 },  // 5  center
    { cx: 270, cy: 505 },  // 6  right
    { cx:  90, cy: 590 },  // 7  left
    { cx: 270, cy: 670 },  // 8  right
    { cx: 200, cy: 750 },  // 9  center
    { cx: 200, cy: 840 },  // 10 boss
];

function buildPath(layout) {
    if (!layout.length) return '';
    let d = `M ${layout[0].cx} ${layout[0].cy}`;
    for (let i = 1; i < layout.length; i++) {
        const p = layout[i - 1];
        const c = layout[i];
        const midY = (p.cy + c.cy) / 2;
        d += ` C ${p.cx} ${midY}, ${c.cx} ${midY}, ${c.cx} ${c.cy}`;
    }
    return d;
}

function nodeStyle(posIdx, isBoss) {
    const { cx, cy } = LAYOUT[posIdx];
    const size = isBoss ? BOSS_SIZE : NODE_SIZE;
    return { left: cx - size / 2 + 'px', top: cy - size / 2 + 'px', width: size + 'px', height: size + 'px' };
}

// ── Zone groupings ──────────────────────────────────────────────────────────
const zones = computed(() =>
    ZONE_DEFS.map((zone) => ({
        ...zone,
        levels: STORY_LEVELS.filter((l) => l.zone === zone.id),
    })),
);

// ── Current level (first non-completed, or last if all done) ────────────────
const currentLevelId = computed(() => {
    for (const l of STORY_LEVELS) {
        if (props.getLevelState(l.id) !== 'completed') return l.id;
    }
    return STORY_LEVELS[STORY_LEVELS.length - 1].id;
});

// ── Scroll to current level on mount ───────────────────────────────────────
const hubRef = ref(null);

onMounted(() => {
    const el = hubRef.value?.querySelector('.node--current');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function handleSelect(level) {
    const state = props.getLevelState(level.id);
    if (state === 'locked') return;
    emit('select-level', level);
}
</script>

<template>
    <div class="hub-container" ref="hubRef">
        <!-- Header bar -->
        <div class="hub-header">
            <button class="back-btn" @click="emit('back')">←</button>
            <span class="hub-title">Story Mode</span>
            <span class="coins-chip">🪙 {{ coins }}</span>
        </div>

        <!-- Zone sections -->
        <div v-for="zone in zones" :key="zone.id" class="zone-section" :style="{ background: zone.bg }">
            <!-- Zone chapter card -->
            <div class="zone-chapter-card">
                <span class="zone-ch-emoji">{{ zone.emoji }}</span>
                <div>
                    <p class="zone-ch-number">Zone {{ zone.id }}</p>
                    <h2 class="zone-ch-name">{{ zone.name }}</h2>
                </div>
            </div>

            <!-- Winding path -->
            <div class="zone-path" :style="{ height: ZONE_HEIGHT + 'px' }">
                <!-- SVG connecting path -->
                <svg
                    class="path-svg"
                    :viewBox="`0 0 ${SVG_W} ${ZONE_HEIGHT}`"
                    preserveAspectRatio="none"
                >
                    <!-- Shadow/background path -->
                    <path
                        :d="buildPath(LAYOUT)"
                        :stroke="zone.accent + '33'"
                        stroke-width="14"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <!-- Foreground path -->
                    <path
                        :d="buildPath(LAYOUT)"
                        :stroke="zone.accent"
                        stroke-width="6"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>

                <!-- Level nodes -->
                <StoryLevelCard
                    v-for="(level, i) in zone.levels"
                    :key="level.id"
                    :level="level"
                    :state="getLevelState(level.id)"
                    :stars="getStars(level.id)"
                    :attempts-today="getAttemptsToday(level.id)"
                    :is-current="level.id === currentLevelId"
                    :accent-color="zone.accent"
                    :position-style="nodeStyle(i, level.boss)"
                    @select="handleSelect(level)"
                />
            </div>
        </div>

        <!-- Bottom padding -->
        <div style="height: 60px" />
    </div>
</template>

<style scoped>
.hub-container {
    height: 100%;
    overflow-y: auto;
    background: #0d1b2a;
    -webkit-overflow-scrolling: touch;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.hub-header {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(13, 27, 42, 0.92);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.back-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.4em;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    opacity: 0.8;
}

.back-btn:hover { opacity: 1; }

.hub-title {
    font-weight: 700;
    font-size: 1em;
    color: #fff;
    letter-spacing: 0.02em;
}

.coins-chip {
    font-weight: 700;
    font-size: 0.95em;
    color: #ffd700;
    background: rgba(255, 215, 0, 0.12);
    padding: 5px 12px;
    border-radius: 100px;
    border: 1px solid rgba(255, 215, 0, 0.25);
}

/* ── Zone section ────────────────────────────────────────────────────────── */
.zone-section { position: relative; }

.zone-chapter-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 28px 24px 16px;
}

.zone-ch-emoji { font-size: 2em; }

.zone-ch-number {
    font-size: 0.7em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 2px;
}

.zone-ch-name {
    font-size: 1.6em;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.01em;
}

/* ── Winding path ────────────────────────────────────────────────────────── */
.zone-path {
    position: relative;
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
}

.path-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

</style>

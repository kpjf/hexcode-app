<script setup>
import { computed } from 'vue';
import { MODIFIER_META } from '../game/storyLevels.js';

const props = defineProps({
    level:         { type: Object, required: true },
    state:         { type: String, required: true }, // 'locked' | 'available' | 'completed'
    stars:         { type: Number, default: 0 },
    attemptsToday: { type: Number, default: 0 },
    isCurrent:     { type: Boolean, default: false },
    accentColor:   { type: String, required: true },
    positionStyle: { type: Object, required: true },
});

const emit = defineEmits(['select']);

const nodeClasses = computed(() => ({
    'node--locked':    props.state === 'locked',
    'node--available': props.state === 'available',
    'node--completed': props.state === 'completed',
    'node--current':   props.isCurrent,
    'node--boss':      props.level.boss,
}));

const starsDisplay = computed(() => '★'.repeat(props.stars) + '☆'.repeat(3 - props.stars));

const modifierEmojis = computed(() => {
    const seen = new Set();
    return props.level.modifiers
        .filter((m) => { if (seen.has(m.type)) return false; seen.add(m.type); return true; })
        .slice(0, 3)
        .map((m) => MODIFIER_META[m.type]?.emoji ?? '')
        .join('');
});
</script>

<template>
    <button
        class="level-node"
        :class="nodeClasses"
        :style="{ ...positionStyle, '--accent': accentColor }"
        :disabled="state === 'locked'"
        @click="emit('select')"
    >
        <!-- Node inner -->
        <span v-if="state === 'completed'" class="node-check">✓</span>
        <span v-else-if="state === 'locked'" class="node-lock">🔒</span>
        <span v-else class="node-num">{{ level.id }}</span>

        <!-- Stars (completed) -->
        <span v-if="state === 'completed'" class="node-stars">{{ starsDisplay }}</span>

        <!-- Modifier chips -->
        <span v-if="level.modifiers.length && state !== 'locked'" class="mod-chips">{{ modifierEmojis }}</span>

        <!-- Attempts pips for available levels -->
        <span v-if="state === 'available'" class="attempt-dots">
            <span
                v-for="n in 3"
                :key="n"
                class="adot"
                :class="{ used: n > 3 - attemptsToday }"
            />
        </span>
    </button>
</template>

<style scoped>
.level-node {
    position: absolute;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    background: var(--accent, #555);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    transition: transform 0.15s, box-shadow 0.15s;
    overflow: visible;
    font-family: inherit;
}

.level-node:not(:disabled):hover {
    transform: scale(1.08);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
}

.node--locked {
    background: #2a2a2a;
    box-shadow: none;
    cursor: default;
}

.node--completed {
    background: var(--accent, #555);
    opacity: 0.7;
}

.node--current {
    opacity: 1 !important;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2), 0 4px 24px rgba(0, 0, 0, 0.5);
    animation: pulse 2.5s ease-in-out infinite;
}

.node--boss {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15), 0 4px 20px rgba(0, 0, 0, 0.5);
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2), 0 4px 24px rgba(0, 0, 0, 0.5); }
    50%       { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.1), 0 4px 24px rgba(0, 0, 0, 0.5); }
}

.node-check, .node-lock, .node-num {
    font-size: 1.3em;
    font-weight: 800;
    color: #fff;
    line-height: 1;
}

.node-lock { font-size: 1.1em; opacity: 0.5; }

.node-stars {
    position: absolute;
    bottom: -20px;
    font-size: 0.65em;
    color: #ffd700;
    letter-spacing: 1px;
    white-space: nowrap;
}

.mod-chips {
    position: absolute;
    top: -20px;
    font-size: 0.8em;
    white-space: nowrap;
}

.attempt-dots {
    position: absolute;
    bottom: -18px;
    display: flex;
    gap: 4px;
}

.adot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent, #fff);
    opacity: 0.9;
}

.adot.used {
    background: rgba(255, 255, 255, 0.2);
    opacity: 0.5;
}
</style>

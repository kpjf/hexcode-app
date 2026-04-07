<script setup>
import AppDialog from './AppDialog.vue';

defineProps({
    visible: { type: Boolean, required: true },
});

defineEmits(['share-pattern', 'share-full', 'close']);
</script>

<template>
    <AppDialog v-if="visible" max-width="360px" @close="$emit('close')">
        <h3>Share</h3>
        <div class="share-options">
            <button class="share-option" @click="$emit('share-pattern')">
                <div class="option-icon">
                    <span class="peg green" />
                    <span class="peg yellow" />
                    <span class="peg dark" />
                    <span class="peg green" />
                </div>
                <div class="option-text">
                    <strong>Pattern only</strong>
                    <span>No spoilers — just your guess results</span>
                </div>
            </button>
            <button class="share-option" @click="$emit('share-full')">
                <div class="option-icon color-squares">
                    <span class="sq" style="background:#d94444" />
                    <span class="sq" style="background:#3366cc" />
                    <span class="sq" style="background:#ccaa00" />
                    <span class="sq" style="background:#33a85a" />
                </div>
                <div class="option-text">
                    <strong>Full review</strong>
                    <span>Shows your guesses and results</span>
                </div>
            </button>
        </div>
    </AppDialog>
</template>

<style scoped>
h3 {
    font-size: 1.1em;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--text-primary);
}

.share-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.share-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    width: 100%;
    color: var(--text-primary);
}

.option-icon {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px;
    flex-shrink: 0;
}

.peg {
    width: 13px;
    height: 13px;
    border-radius: 50%;
}

.peg.green  { background: #22c55e; }
.peg.yellow { background: #eab308; }
.peg.dark   { background: #3a3a3a; }

.option-icon.color-squares {
    grid-template-columns: 1fr 1fr;
    gap: 3px;
}

.sq {
    width: 13px;
    height: 13px;
    border-radius: 2px;
}

.option-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.option-text strong {
    font-size: 0.95em;
    font-weight: 600;
}

.option-text span {
    font-size: 0.8em;
    color: var(--text-secondary);
}
</style>

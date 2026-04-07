<script setup>
import { ref, watch, nextTick } from 'vue';
import AppButton from './AppButton.vue';
import AppDialog from './AppDialog.vue';

const props = defineProps({
    visible: { type: Boolean, required: true },
    initialSeed: { type: String, default: '' },
});

const emit = defineEmits(['confirm', 'cancel']);

const inputValue = ref('');
const inputEl = ref(null);

watch(() => props.visible, async (val) => {
    if (val) {
        inputValue.value = props.initialSeed;
        await nextTick();
        inputEl.value?.focus();
    }
});

function handleConfirm() {
    emit('confirm', inputValue.value || null);
}
</script>

<template>
    <AppDialog v-if="visible" max-width="380px" @close="$emit('cancel')">
        <h3>Enter Seed Phrase</h3>
        <p>Enter a seed for a reproducible game, or leave empty for random.</p>
        <input
            ref="inputEl"
            v-model="inputValue"
            type="text"
            class="modal-input"
            placeholder="e.g. myseed123"
            @keydown.enter="handleConfirm"
            @keydown.esc="$emit('cancel')"
        >
        <div class="modal-actions">
            <AppButton variant="secondary" @click="$emit('cancel')">Cancel</AppButton>
            <AppButton @click="handleConfirm">Start Game</AppButton>
        </div>
    </AppDialog>
</template>

<style scoped>
h3 {
    font-size: 1.1em;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text-primary);
}

p {
    font-size: 0.88em;
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.modal-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    font-size: 0.95em;
    background: #ffffff;
    color: var(--text-primary);
    margin-bottom: 16px;
    outline: none;
    box-sizing: border-box;
}

.modal-input:focus {
    border-color: var(--text-primary);
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}
</style>

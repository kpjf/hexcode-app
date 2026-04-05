<script setup>
import { ref, watch } from 'vue';
import AppButton from './AppButton.vue';

const props = defineProps({
    visible: { type: Boolean, required: true },
});

const emit = defineEmits(['close']);

const dialogEl = ref(null);

watch(
    () => props.visible,
    (val) => {
        if (val) {
            dialogEl.value?.showModal();
        } else {
            dialogEl.value?.close();
        }
    },
);
</script>

<template>
    <dialog ref="dialogEl" @cancel.prevent="$emit('close')" @click.self="$emit('close')">
        <h3>Already tried that</h3>
        <p class="message">You've already guessed this combination. Try a different one.</p>
        <div class="modal-footer">
            <AppButton @click="$emit('close')">OK</AppButton>
        </div>
    </dialog>
</template>

<style scoped>
dialog {
    background: var(--bg-modal);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 28px 24px;
    max-width: 320px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

dialog h3 {
    font-size: 1.1em;
    font-weight: 700;
    margin-bottom: 10px;
}

.message {
    font-size: 0.9em;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 22px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
}
</style>

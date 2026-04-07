<script setup>
import AppButton from './AppButton.vue';
import AppDialog from './AppDialog.vue';

defineProps({
    visible: { type: Boolean, required: true },
});

defineEmits(['close']);
</script>

<template>
    <AppDialog v-if="visible" max-width="320px" @close="$emit('close')">
        <h3>Already tried that</h3>
        <p class="message">You've already guessed this combination. Try a different one.</p>
        <div class="modal-footer">
            <AppButton @click="$emit('close')">OK</AppButton>
        </div>
    </AppDialog>
</template>

<style scoped>
h3 {
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

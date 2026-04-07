<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    maxWidth: { type: String, default: '400px' },
});

const emit = defineEmits(['close']);
const dialogEl = ref(null);

onMounted(() => dialogEl.value?.showModal());
</script>

<template>
    <dialog
        ref="dialogEl"
        :style="{ maxWidth: props.maxWidth }"
        @cancel.prevent="emit('close')"
        @click.self="emit('close')"
    >
        <button class="close-btn" @click="emit('close')">✕</button>
        <slot />
    </dialog>
</template>

<style scoped>
dialog {
    background: #ffffff;
    color: var(--text-primary);
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    padding: 40px 28px 28px;
    width: 90%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 1.1em;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
}

.close-btn:hover {
    color: var(--text-primary);
}
</style>

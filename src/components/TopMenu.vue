<script setup>
defineProps({
    darkMode: {
        type: Boolean,
        required: true,
    },
});

defineEmits(['toggle-dark-mode', 'new-game']);
</script>

<template>
    <div class="top-menu">
        <div class="menu-content">
            <div class="menu-left">
                <RouterLink to="/">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        :style="{ stroke: darkMode ? '#fff' : '#111' }"
                    >
                        <path
                            d="M13 4L7 10L13 16"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                    </svg>
                </RouterLink>
            </div>
            <div class="menu-right">
                <button
                    class="btn btn-menu"
                    title="Toggle dark mode"
                    @click="$emit('toggle-dark-mode')"
                >
                    <svg
                        width="18"
                        height="22"
                        viewBox="0 0 18 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        :style="{ color: darkMode ? '#fff' : '#111' }"
                    >
                        <!-- plate -->
                        <rect x="1" y="1" width="16" height="20" rx="3" stroke="currentColor" stroke-width="1.5"/>
                        <!-- rocker: up = light, down = dark -->
                        <rect x="4" :y="darkMode ? 11 : 3" width="10" height="8" rx="2" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.top-menu {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.menu-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 560px;
    margin: 0 auto;
}

.menu-left {
    flex: 1;
    text-align: left;
}

.menu-left a {
    display: inline-flex;
    justify-content: start;
    align-items: center;
    gap: 6px;
    text-decoration: none;
}


.menu-center {
    flex: 1;
    text-align: center;
}

.menu-center h2 {
    font-size: 1.4em;
    font-weight: 700;
    margin: 0;
}

.menu-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
}

.btn-menu {
    background: transparent;
    padding: 8px 14px;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;
    appearance: none;
    display: flex;
    align-items: center;
}

.btn-menu:hover {
    opacity: 0.7;
}

@media (max-width: 480px) {
    .top-menu {
        padding: 8px 12px;
    }

    .menu-center h2 {
        font-size: 1.2em;
    }

    .btn-menu {
        padding: 7px 12px;
        font-size: 0.8em;
    }
}

@media (max-width: 380px) {
    .top-menu {
        padding: 10px 12px;
    }

    .menu-center h2 {
        font-size: 1.1em;
    }
}
</style>

<script setup>
import { computed } from 'vue';
import AppButton from './AppButton.vue';

const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

const props = defineProps({
    isAuthenticated: { type: Boolean, default: false },
    completedModes: { type: Object, default: () => ({}) },
});

const emit = defineEmits([
    'play-daily',
    'play-random',
    'story',
    'battle',
    'login',
    'signup',
    'logout',
    'stats',
]);

const primaryDailyMode = computed(() => {
    if (!props.completedModes.quick) return 'quick';
    if (!props.completedModes.classic) return 'classic';
    return 'quick';
});
</script>

<template>
    <div class="intro-container">
        <div class="intro-card">
            <main>
                <div class="intro-logo">
                    <slot name="logo">
                        <img src="/images/logo.svg" />
                    </slot>
                </div>

                <h1 class="intro-title">HEXCODE</h1>
                <p class="intro-description">Break the secret code. A new puzzle every day.</p>

                <div class="primary-action">
                    <AppButton
                        full
                        on-dark
                        size="lg"
                        :completed="completedModes[primaryDailyMode]"
                        @click="emit('play-daily', primaryDailyMode)"
                    >
                        Play Daily
                    </AppButton>
                </div>

                <div class="mode-toggle">
                    <AppButton
                        full
                        variant="secondary"
                        on-dark
                        size="md"
                        :completed="completedModes.quick"
                        @click="emit('play-daily', 'quick')"
                    >
                        Quick
                    </AppButton>
                    <AppButton
                        full
                        variant="secondary"
                        on-dark
                        size="md"
                        :completed="completedModes.classic"
                        @click="emit('play-daily', 'classic')"
                    >
                        Classic
                    </AppButton>
                    <AppButton
                        variant="ghost"
                        size="lg"
                        on-dark
                        @click="emit('play-random', 'quick')"
                    >
                        Random Game
                    </AppButton>
                    <AppButton variant="ghost" size="lg" on-dark @click="emit('story')">
                        Story Mode
                    </AppButton>
                    <AppButton variant="ghost" size="lg" on-dark @click="emit('battle')">
                        Battle Mode
                    </AppButton>
                </div>

                <div class="intro-puzzle-date">
                    <span class="date-value">{{ today }}</span>
                </div>
            </main>

            <footer>
                <div class="intro-account">
                    <template v-if="props.isAuthenticated">
                        <AppButton full variant="ghost" size="sm" on-dark @click="emit('stats')"
                            >Stats</AppButton
                        >
                        <AppButton full variant="ghost" size="sm" on-dark @click="emit('logout')"
                            >Logout</AppButton
                        >
                    </template>
                    <template v-else>
                        <AppButton full variant="ghost" size="sm" on-dark @click="emit('login')"
                            >Login</AppButton
                        >
                        <AppButton full variant="ghost" size="sm" on-dark @click="emit('signup')"
                            >Sign Up</AppButton
                        >
                    </template>
                </div>
            </footer>
        </div>
    </div>
</template>

<style scoped>
.intro-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    padding: 16px;
    background-color: var(--board-bg);
}

.intro-card {
    max-width: 390px;
    width: 100%;
    text-align: center;
    animation: slideIn 0.3s ease-out;
    min-height: calc(100dvh - 32px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    main {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 10px 0;
    }

    footer {
        flex: 0 0 auto;
        width: 100%;
        padding: 0 0 4px;
        display: flex;
        justify-content: center;
        align-content: center;
        gap: 0.5rem;
        flex-direction: column;
    }
}

.intro-logo {
    margin: 0 auto 10px !important;
    width: clamp(64px, 16vw, 90px);
}

.logo-placeholder {
    width: 80px;
    height: 80px;
    background: var(--bg-secondary);
    border: 2px dashed var(--border-color);
    margin: 0 auto;
}

.intro-title {
    font-size: clamp(2rem, 8vw, 2.4rem);
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
}

.intro-description {
    color: var(--text-primary);
    font-size: 1rem;
    line-height: 1.35;
    max-width: 25ch;
    margin: 0 auto 14px;
}

.primary-action {
    width: min(100%, 300px);
    margin-bottom: 8px;
}

.mode-toggle {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: min(100%, 300px);
    margin-bottom: 8px;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
}

.mode-toggle > :nth-child(n + 3) {
    grid-column: auto;
}

.mode-toggle > :last-child {
    grid-column: 1 / -1;
}

.mode-description {
    font-size: 0.8em;
    color: var(--text-secondary);
    margin-bottom: 20px;
    letter-spacing: 0.02em;
}

.intro-puzzle-date {
    background: transparent;
    padding: 6px 16px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.date-label {
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #fff;
}

.date-value {
    font-size: 0.84em;
    font-weight: 600;
    color: var(--text-primary);
}

.intro-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
}

.intro-btn {
    width: 100%;
    padding: 13px 20px;
    font-size: 1em;
}

.intro-account {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    justify-content: center;
    width: min(100%, 220px);
    margin: 0 auto;
    padding-top: 8px;
}

@media (max-width: 480px) {
    .intro-container {
        align-items: stretch;
        padding: 10px;
    }

    .intro-card {
        min-height: calc(100dvh - 20px);
    }

    .intro-card main {
        justify-content: flex-start;
        padding-top: clamp(44px, 12dvh, 96px);
    }

    .intro-logo {
        width: 64px;
        margin-bottom: 8px !important;
    }

    .intro-description {
        margin-bottom: 12px;
    }

    .intro-puzzle-date {
        padding-top: 4px;
    }

    .intro-account {
        padding-top: 6px;
    }
}

@media (max-height: 720px) {
    .intro-card main {
        justify-content: center;
        padding-top: 8px;
    }

    .intro-description {
        display: none;
    }
}
</style>

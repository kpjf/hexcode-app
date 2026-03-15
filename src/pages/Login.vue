<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth.js';

const { login, isLoading, error } = useAuth();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const localError = ref('');

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
const passwordValid = computed(() => password.value.length >= 6);
const canSubmit = computed(() => emailValid.value && passwordValid.value && !isLoading.value);

async function handleSubmit() {
    localError.value = '';
    if (!emailValid.value) {
        localError.value = 'Please enter a valid email address.';
        return;
    }
    if (!passwordValid.value) {
        localError.value = 'Password must be at least 6 characters.';
        return;
    }
    try {
        await login(email.value, password.value);
    } catch {
        // error is exposed via the store; localError only for validation
    }
}

const appName = import.meta.env.VITE_APP_NAME || 'App';
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <h1>{{ appName }}</h1>
            <h2>Sign in</h2>

            <form @submit.prevent="handleSubmit" novalidate>
                <div class="field">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        placeholder="you@example.com"
                        :disabled="isLoading"
                    />
                </div>

                <div class="field">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input
                            id="password"
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="current-password"
                            placeholder="••••••••"
                            :disabled="isLoading"
                        />
                        <button
                            type="button"
                            class="toggle-password"
                            @click="showPassword = !showPassword"
                            :aria-label="showPassword ? 'Hide password' : 'Show password'"
                        >
                            {{ showPassword ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                </div>

                <p v-if="localError || error" class="error-msg">{{ localError || error }}</p>

                <button type="submit" class="submit-btn" :disabled="!canSubmit">
                    <span v-if="isLoading">Signing in…</span>
                    <span v-else>Sign in</span>
                </button>

                <Router-Link to="/">home</Router-Link>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--bg-color, #1a1a1a);
}

.login-card {
    width: 100%;
    max-width: 380px;
    padding: 2rem;
    background: var(--card-bg, #2a2a2a);
    border-radius: 12px;
    border: 1px solid var(--border-color, #333);
}

h1 {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    color: var(--text-primary, #fff);
    text-align: center;
}

h2 {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    font-weight: 400;
    color: var(--text-secondary, #aaa);
    text-align: center;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
}

label {
    font-size: 0.85rem;
    color: var(--text-secondary, #aaa);
}

input {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border-color, #444);
    border-radius: 6px;
    background: var(--input-bg, #1a1a1a);
    color: var(--text-primary, #fff);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.15s;
}

input:focus {
    border-color: var(--accent, #6c8ff7);
}

input:disabled {
    opacity: 0.5;
}

.password-wrapper {
    position: relative;
    display: flex;
}

.password-wrapper input {
    flex: 1;
    padding-right: 4rem;
}

.toggle-password {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary, #aaa);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
}

.toggle-password:hover {
    color: var(--text-primary, #fff);
}

.error-msg {
    color: #e05555;
    font-size: 0.85rem;
    margin: 0 0 0.75rem;
}

.submit-btn {
    width: 100%;
    padding: 0.7rem;
    background: var(--accent, #6c8ff7);
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-top: 0.5rem;
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
    opacity: 0.85;
}
</style>

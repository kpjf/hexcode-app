<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { authApi } from '../utils/auth-client.js';
import AppButton from './AppButton.vue';

const AUTH_PANELS = {
    '/login': 'login',
    '/signup': 'signup',
    '/forgot-password': 'forgot',
    '/reset-password': 'reset',
};

const route = useRoute();
const router = useRouter();
const { login, register, isLoading, error: authError } = useAuth();

const el = ref(null);
const panel = ref('login');

// ── Login ─────────────────────────────────────────────────────────────────
const loginEmail = ref('');
const loginPassword = ref('');
const loginShowPwd = ref(false);
const loginLocalError = ref('');

const loginEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.value));
const loginPwdValid = computed(() => loginPassword.value.length >= 6);
const loginCanSubmit = computed(
    () => loginEmailValid.value && loginPwdValid.value && !isLoading.value,
);

async function handleLogin() {
    loginLocalError.value = '';
    if (!loginEmailValid.value) {
        loginLocalError.value = 'Please enter a valid email address.';
        return;
    }
    if (!loginPwdValid.value) {
        loginLocalError.value = 'Password must be at least 6 characters.';
        return;
    }
    try {
        await login(loginEmail.value, loginPassword.value);
    } catch {
        /* authError handles it */
    }
}

// ── Signup ────────────────────────────────────────────────────────────────
const signupName = ref('');
const signupEmail = ref('');
const signupPassword = ref('');
const signupShowPwd = ref(false);
const signupLocalError = ref('');

const signupNameValid = computed(() => signupName.value.trim().length >= 2);
const signupEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.value));
const signupPwdValid = computed(() => signupPassword.value.length >= 6);
const signupCanSubmit = computed(
    () =>
        signupNameValid.value && signupEmailValid.value && signupPwdValid.value && !isLoading.value,
);

async function handleSignup() {
    signupLocalError.value = '';
    if (!signupNameValid.value) {
        signupLocalError.value = 'Name must be at least 2 characters.';
        return;
    }
    if (!signupEmailValid.value) {
        signupLocalError.value = 'Please enter a valid email address.';
        return;
    }
    if (!signupPwdValid.value) {
        signupLocalError.value = 'Password must be at least 6 characters.';
        return;
    }
    try {
        await register({
            name: signupName.value.trim(),
            email: signupEmail.value,
            password: signupPassword.value,
        });
    } catch {
        /* authError handles it */
    }
}

// ── Forgot password ───────────────────────────────────────────────────────
const forgotEmail = ref('');
const forgotIsLoading = ref(false);
const forgotError = ref('');
const forgotSuccess = ref(false);

const forgotEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.value));
const forgotCanSubmit = computed(() => forgotEmailValid.value && !forgotIsLoading.value);

async function handleForgot() {
    forgotError.value = '';
    if (!forgotEmailValid.value) {
        forgotError.value = 'Please enter a valid email address.';
        return;
    }
    forgotIsLoading.value = true;
    try {
        await authApi.forgotPassword(forgotEmail.value);
        forgotSuccess.value = true;
    } catch (err) {
        forgotError.value = err.message || 'Something went wrong. Please try again.';
    } finally {
        forgotIsLoading.value = false;
    }
}

// ── Reset password ────────────────────────────────────────────────────────
const resetToken = computed(() => route.query.token);
const resetPassword = ref('');
const resetConfirm = ref('');
const resetShowPwd = ref(false);
const resetIsLoading = ref(false);
const resetError = ref('');
const resetSuccess = ref(false);

const resetPwdValid = computed(() => resetPassword.value.length >= 6);
const resetPwdsMatch = computed(() => resetPassword.value === resetConfirm.value);
const resetCanSubmit = computed(
    () => resetPwdValid.value && resetPwdsMatch.value && !resetIsLoading.value,
);

async function handleReset() {
    resetError.value = '';
    if (!resetToken.value) {
        resetError.value = 'No reset token provided.';
        return;
    }
    if (!resetPwdValid.value) {
        resetError.value = 'Password must be at least 6 characters.';
        return;
    }
    if (!resetPwdsMatch.value) {
        resetError.value = 'Passwords do not match.';
        return;
    }
    resetIsLoading.value = true;
    try {
        await authApi.resetPassword(resetToken.value, resetPassword.value);
        resetSuccess.value = true;
    } catch (err) {
        resetError.value = err.message || 'Password reset failed.';
    } finally {
        resetIsLoading.value = false;
    }
}

// ── Dialog open/close ─────────────────────────────────────────────────────
const appName = import.meta.env.VITE_APP_NAME || 'App';

function openForRoute(path) {
    const p = AUTH_PANELS[path];
    if (p) {
        panel.value = p;
        if (!el.value?.open) el.value?.showModal();
    } else {
        el.value?.close();
    }
}

onMounted(() => openForRoute(route.path));
watch(() => route.path, openForRoute);

function handleClose() {
    router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/');
}

function handleCancel(e) {
    e.preventDefault();
    handleClose();
}
</script>

<template>
    <dialog ref="el" @cancel="handleCancel" @click.self="handleClose">
        <button class="close-btn" aria-label="Close" @click="handleClose">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </button>

        <div class="dialog-header">
            <img src="/images/logo.svg" class="logo" alt="HEXCode" />
            <h2>{{ appName }}</h2>
        </div>

        <!-- Login -->
        <template v-if="panel === 'login'">
            <h3>Sign in</h3>
            <form @submit.prevent="handleLogin" novalidate>
                <div class="field">
                    <label for="login-email">Email</label>
                    <input
                        id="login-email"
                        v-model="loginEmail"
                        type="email"
                        autocomplete="email"
                        placeholder="you@example.com"
                        :disabled="isLoading"
                    />
                </div>
                <div class="field">
                    <label for="login-password">Password</label>
                    <div class="password-wrapper">
                        <input
                            id="login-password"
                            v-model="loginPassword"
                            :type="loginShowPwd ? 'text' : 'password'"
                            autocomplete="current-password"
                            :disabled="isLoading"
                        />
                        <button
                            type="button"
                            class="toggle-pwd"
                            @click="loginShowPwd = !loginShowPwd"
                            :aria-label="loginShowPwd ? 'Hide password' : 'Show password'"
                        >
                            {{ loginShowPwd ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                </div>
                <p class="forgot-link">
                    <RouterLink to="/forgot-password">Forgot password?</RouterLink>
                </p>
                <p v-if="loginLocalError || authError" class="error-msg">
                    {{ loginLocalError || authError }}
                </p>
                <AppButton
                    type="submit"
                    :full="true"
                    :disabled="!loginCanSubmit"
                    class="submit-btn"
                >
                    <span v-if="isLoading">Signing in…</span>
                    <span v-else>Sign in</span>
                </AppButton>
                <p class="switch-link">
                    Don't have an account? <RouterLink to="/signup">Sign up</RouterLink>
                </p>
            </form>
        </template>

        <!-- Signup -->
        <template v-else-if="panel === 'signup'">
            <h3>Create an account</h3>
            <form @submit.prevent="handleSignup" novalidate>
                <div class="field">
                    <label for="signup-name">Name</label>
                    <input
                        id="signup-name"
                        v-model="signupName"
                        type="text"
                        autocomplete="name"
                        placeholder="Your name"
                        :disabled="isLoading"
                    />
                </div>
                <div class="field">
                    <label for="signup-email">Email</label>
                    <input
                        id="signup-email"
                        v-model="signupEmail"
                        type="email"
                        autocomplete="email"
                        placeholder="you@example.com"
                        :disabled="isLoading"
                    />
                </div>
                <div class="field">
                    <label for="signup-password">Password</label>
                    <div class="password-wrapper">
                        <input
                            id="signup-password"
                            v-model="signupPassword"
                            :type="signupShowPwd ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="••••••••"
                            :disabled="isLoading"
                        />
                        <button
                            type="button"
                            class="toggle-pwd"
                            @click="signupShowPwd = !signupShowPwd"
                            :aria-label="signupShowPwd ? 'Hide password' : 'Show password'"
                        >
                            {{ signupShowPwd ? 'Hide' : 'Show' }}
                        </button>
                    </div>
                </div>
                <p v-if="signupLocalError || authError" class="error-msg">
                    {{ signupLocalError || authError }}
                </p>
                <AppButton
                    type="submit"
                    :full="true"
                    :disabled="!signupCanSubmit"
                    class="submit-btn"
                >
                    <span v-if="isLoading">Creating account…</span>
                    <span v-else>Sign up</span>
                </AppButton>
                <p class="switch-link">
                    Already have an account? <RouterLink to="/login">Sign in</RouterLink>
                </p>
            </form>
        </template>

        <!-- Forgot password -->
        <template v-else-if="panel === 'forgot'">
            <div v-if="forgotSuccess" class="success-state">
                <h3>Check your email</h3>
                <p class="subtitle">
                    If an account exists for <strong>{{ forgotEmail }}</strong
                    >, we sent a reset link.
                </p>
                <AppButton :full="true" @click="router.replace('/login')"
                    >Back to sign in</AppButton
                >
            </div>
            <template v-else>
                <h3>Forgot password</h3>
                <form @submit.prevent="handleForgot" novalidate>
                    <div class="field">
                        <label for="forgot-email">Email</label>
                        <input
                            id="forgot-email"
                            v-model="forgotEmail"
                            type="email"
                            autocomplete="email"
                            placeholder="you@example.com"
                            :disabled="forgotIsLoading"
                        />
                    </div>
                    <p v-if="forgotError" class="error-msg">{{ forgotError }}</p>
                    <AppButton
                        type="submit"
                        :full="true"
                        :disabled="!forgotCanSubmit"
                        class="submit-btn"
                    >
                        <span v-if="forgotIsLoading">Sending…</span>
                        <span v-else>Send reset link</span>
                    </AppButton>
                    <p class="switch-link"><RouterLink to="/login">Back to sign in</RouterLink></p>
                </form>
            </template>
        </template>

        <!-- Reset password -->
        <template v-else-if="panel === 'reset'">
            <div v-if="resetSuccess" class="success-state">
                <h3>Password reset!</h3>
                <p class="subtitle">Your password has been updated. You can now sign in.</p>
                <AppButton :full="true" @click="router.replace('/login')">Sign in</AppButton>
            </div>
            <template v-else>
                <h3>Reset password</h3>
                <form @submit.prevent="handleReset" novalidate>
                    <div class="field">
                        <label for="reset-password">New password</label>
                        <div class="password-wrapper">
                            <input
                                id="reset-password"
                                v-model="resetPassword"
                                :type="resetShowPwd ? 'text' : 'password'"
                                autocomplete="new-password"
                                placeholder="••••••••"
                                :disabled="resetIsLoading"
                            />
                            <button
                                type="button"
                                class="toggle-pwd"
                                @click="resetShowPwd = !resetShowPwd"
                                :aria-label="resetShowPwd ? 'Hide password' : 'Show password'"
                            >
                                {{ resetShowPwd ? 'Hide' : 'Show' }}
                            </button>
                        </div>
                    </div>
                    <div class="field">
                        <label for="reset-confirm">Confirm new password</label>
                        <input
                            id="reset-confirm"
                            v-model="resetConfirm"
                            :type="resetShowPwd ? 'text' : 'password'"
                            autocomplete="new-password"
                            placeholder="••••••••"
                            :disabled="resetIsLoading"
                        />
                    </div>
                    <p v-if="resetError" class="error-msg">{{ resetError }}</p>
                    <AppButton
                        type="submit"
                        :full="true"
                        :disabled="!resetCanSubmit"
                        class="submit-btn"
                    >
                        <span v-if="resetIsLoading">Resetting…</span>
                        <span v-else>Reset password</span>
                    </AppButton>
                    <p class="switch-link"><RouterLink to="/login">Back to sign in</RouterLink></p>
                </form>
            </template>
        </template>
    </dialog>
</template>

<style scoped>
dialog {
    background: var(--bg-modal, var(--bg-secondary));
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 380px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

.close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    line-height: 0;
}

.close-btn:hover {
    color: var(--text-primary);
}

.dialog-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.logo {
    width: 64px;
    opacity: 0.9;
}

h2 {
    font-size: 1.4rem;
    color: var(--text-primary);
    margin: 0;
}

h3 {
    font-size: 1rem;
    font-weight: 400;
    color: var(--text-secondary);
    text-align: center;
    margin: 0 0 1.5rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
}

label {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

input {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-modal);
    color: var(--text-primary);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.15s;
    font-family: inherit;
}

input:focus {
    border-color: var(--text-primary);
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

.toggle-pwd {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    font-family: inherit;
}

.toggle-pwd:hover {
    color: var(--text-primary);
}

.forgot-link {
    text-align: right;
    margin: -0.25rem 0 0.75rem;
    font-size: 0.8rem;
}

.forgot-link a {
    color: var(--text-secondary);
    text-decoration: none;
}

.forgot-link a:hover {
    color: var(--text-primary);
    text-decoration: underline;
}

.error-msg {
    color: #e05555;
    font-size: 0.85rem;
    margin: 0 0 0.75rem;
}

.submit-btn {
    margin-top: 0.5rem;
}

.switch-link {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.switch-link a {
    color: var(--text-primary);
    font-weight: 600;
    text-decoration: none;
}

.switch-link a:hover {
    text-decoration: underline;
}

.success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
}

.success-state h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.subtitle {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}
</style>

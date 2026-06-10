import { useAuthStore } from '../stores/auth.js'

const TIMEOUT_MS = 10_000

class AuthClient {
  #baseUrl
  #isRefreshing = false
  #refreshQueue = []

  constructor(baseUrl) {
    this.#baseUrl = baseUrl
  }

  async #request(path, options = {}) {
    const authStore = useAuthStore()

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const makeRequest = async (token) => {
      const res = await fetch(`${this.#baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      })
      return res
    }

    try {
      let res = await makeRequest(authStore.accessToken)

      if (res.status === 401) {
        // Queue concurrent 401s while a refresh is in progress
        if (this.#isRefreshing) {
          const retryToken = await new Promise((resolve, reject) => {
            this.#refreshQueue.push({ resolve, reject })
          })
          res = await makeRequest(retryToken)
        } else {
          this.#isRefreshing = true
          try {
            await authStore.refreshTokens()
            const newToken = authStore.accessToken
            this.#refreshQueue.forEach(({ resolve }) => resolve(newToken))
            this.#refreshQueue = []
            res = await makeRequest(newToken)
          } catch {
            this.#refreshQueue.forEach(({ reject }) => reject(new Error('Session expired')))
            this.#refreshQueue = []
            await authStore.logout()
            throw new Error('Session expired. Please log in again.')
          } finally {
            this.#isRefreshing = false
          }
        }
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Request failed: ${res.status}`)
      }

      // Handle empty responses (e.g. 204 No Content)
      const text = await res.text()
      return text ? JSON.parse(text) : null
    } finally {
      clearTimeout(timer)
    }
  }

  get(path, options = {}) {
    return this.#request(path, { ...options, method: 'GET' })
  }

  post(path, body, options = {}) {
    return this.#request(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  put(path, body, options = {}) {
    return this.#request(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  delete(path, options = {}) {
    return this.#request(path, { ...options, method: 'DELETE' })
  }
}

const client = new AuthClient(`${import.meta.env.VITE_AUTH_SERVICE_URL}/${import.meta.env.VITE_APP_SLUG}`)
// zuul-data universal store — per-user JSON addressed by bucket/key
const store = new AuthClient(`${import.meta.env.VITE_DATA_SERVICE_URL}/data/${import.meta.env.VITE_APP_SLUG}`)
// Legacy hexcode-api: still hosts the battle socket, and read once to migrate a
// player's stats/story into zuul-data.
const legacy = new AuthClient(import.meta.env.VITE_DATA_API_URL)

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (userData) => client.post('/auth/register', userData),
  logout: (refreshToken) => client.post('/auth/logout', { refreshToken }),
  logoutAll: () => client.post('/auth/logout-all'),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  me: () => client.get('/auth/me'),
  verifyEmail: (token) => client.post('/auth/verify-email', { token }),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => client.post('/auth/reset-password', { token, password }),
}

export const userApi = {
  getProfile: () => client.get('/users/me'),
  updateProfile: (data) => client.put('/users/me', data),
  changePassword: (currentPassword, newPassword) =>
    client.put('/users/me/password', { currentPassword, newPassword }),
}

export const sessionApi = {
  getMySessions: () => client.get('/sessions/me'),
  invalidateSession: (id) => client.delete(`/sessions/me/${id}`),
  invalidateAllSessions: () => client.delete('/sessions/me'),
}

// Stats & story are single per-user documents in zuul-data:
//   bucket "stats" / key "default" → { classic, quick }
//   bucket "story" / key "default" → { coins, storyMode }
// zuul-data wraps the body in { data }; a 404 means no document yet (treat as empty).
export const statsApi = {
  get: () =>
    store
      .get('/stats/default')
      .then((d) => d?.data ?? {})
      .catch((e) => {
        if (/not found/i.test(e.message)) return {}
        throw e
      }),
  post: (data) => store.put('/stats/default', data),
}

export const storyApi = {
  get: () =>
    store
      .get('/story/default')
      .then((d) => d?.data ?? null)
      .catch((e) => {
        if (/not found/i.test(e.message)) return null
        throw e
      }),
  save: (doc) => store.put('/story/default', doc),
}

// Read-only legacy hexcode-api — best-effort, used once to migrate an existing
// player's data into zuul-data. Returns null if the old API is gone or empty.
export const legacyStatsApi = {
  get: () => legacy.get('/v1/stats').catch(() => null),
}
export const legacyStoryApi = {
  get: () => legacy.get('/v1/story').catch(() => null),
}

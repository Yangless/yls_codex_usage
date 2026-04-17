import type { PersistedSettings, SettingsStorage } from '../storage'

const SETTINGS_KEY = 'codex-usage-settings'
const SECRET_KEY = 'codex-usage-secret'
const DEFAULT_POLL_INTERVAL = 60_000

function normalizePollInterval(value: unknown): number {
  const candidate = Number(value)
  if (!Number.isFinite(candidate) || candidate < 0) return DEFAULT_POLL_INTERVAL
  return candidate
}

export function createWebStorage(): SettingsStorage {
  return {
    async loadSettings() {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (!raw) return { pollInterval: DEFAULT_POLL_INTERVAL }
      try {
        const parsed = JSON.parse(raw)
        return { pollInterval: normalizePollInterval(parsed?.pollInterval) }
      } catch {
        localStorage.removeItem(SETTINGS_KEY)
        return { pollInterval: DEFAULT_POLL_INTERVAL }
      }
    },
    async saveSettings(settings: PersistedSettings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    },
    async clearSettings() {
      localStorage.removeItem(SETTINGS_KEY)
    },
    async loadSecret() {
      return localStorage.getItem(SECRET_KEY)
    },
    async saveSecret(secret: string) {
      localStorage.setItem(SECRET_KEY, secret)
    },
    async clearSecret() {
      localStorage.removeItem(SECRET_KEY)
    }
  }
}

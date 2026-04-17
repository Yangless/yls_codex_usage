export type PersistedSettings = { pollInterval: number }

export interface SettingsStorage {
  loadSettings(): Promise<PersistedSettings>
  saveSettings(settings: PersistedSettings): Promise<void>
  clearSettings(): Promise<void>
  loadSecret(): Promise<string | null>
  saveSecret(secret: string): Promise<void>
  clearSecret(): Promise<void>
}

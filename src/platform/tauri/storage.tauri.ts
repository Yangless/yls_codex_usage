import { appDataDir, join } from '@tauri-apps/api/path'
import { load } from '@tauri-apps/plugin-store'
import { Client, Stronghold } from '@tauri-apps/plugin-stronghold'
import type { PersistedSettings, SettingsStorage } from '../storage'

const SETTINGS_FILE = 'settings.json'
const CLIENT_NAME = 'codex-usage'
const SECRET_KEY = 'api-key'
const DEFAULT_POLL_INTERVAL = 60_000
let strongholdClientPromise: Promise<{ stronghold: Stronghold; client: Client }> | null = null
let cachedSecretValue: string | null | undefined = undefined

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function normalizePollInterval(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_POLL_INTERVAL
  }

  if (!Number.isFinite(value) || value < 0) {
    return DEFAULT_POLL_INTERVAL
  }

  return value
}

async function createStrongholdClient(): Promise<{ stronghold: Stronghold; client: Client }> {
  let vaultPath = ''
  try {
    vaultPath = await join(await appDataDir(), 'vault.hold')
  } catch (error) {
    throw new Error(`解析 Stronghold 路径失败：${getErrorMessage(error)}`)
  }

  let stronghold: Stronghold
  try {
    stronghold = await Stronghold.load(vaultPath, 'codex-usage-local-vault')
  } catch (error) {
    throw new Error(`Stronghold.load 失败：${getErrorMessage(error)}`)
  }

  try {
    const client = await stronghold.loadClient(CLIENT_NAME)
    return { stronghold, client }
  } catch (loadError) {
    try {
      const client = await stronghold.createClient(CLIENT_NAME)
      return { stronghold, client }
    } catch (createError) {
      throw new Error(
        `Stronghold client 初始化失败。loadClient: ${getErrorMessage(loadError)}；createClient: ${getErrorMessage(createError)}`
      )
    }
  }
}

async function loadStrongholdClient(): Promise<{ stronghold: Stronghold; client: Client }> {
  if (!strongholdClientPromise) {
    strongholdClientPromise = createStrongholdClient().catch((error) => {
      strongholdClientPromise = null
      throw error
    })
  }

  return strongholdClientPromise
}

export function createTauriStorage(): SettingsStorage {
  void loadStrongholdClient().catch(() => {
    // Prewarm Stronghold off the click path. Failures surface during actual use.
  })

  return {
    async loadSettings() {
      const store = await load(SETTINGS_FILE, { autoSave: 100 })
      return {
        pollInterval: normalizePollInterval(await store.get<number>('pollInterval'))
      }
    },
    async saveSettings(settings: PersistedSettings) {
      const store = await load(SETTINGS_FILE, { autoSave: 100 })
      await store.set('pollInterval', settings.pollInterval)
      await store.delete('debugProbe')
      await store.save()
    },
    async clearSettings() {
      const store = await load(SETTINGS_FILE, { autoSave: 100 })
      await store.delete('pollInterval')
      await store.delete('debugProbe')
      await store.save()
    },
    async loadSecret() {
      const { client } = await loadStrongholdClient()
      const store = client.getStore()
      const data = await store.get(SECRET_KEY)
      cachedSecretValue = data ? new TextDecoder().decode(new Uint8Array(data)) : null
      return cachedSecretValue
    },
    async saveSecret(secret: string) {
      if (cachedSecretValue === secret) {
        return
      }

      const { stronghold, client } = await loadStrongholdClient()

      try {
        const store = client.getStore()
        await store.insert(SECRET_KEY, Array.from(new TextEncoder().encode(secret)))
      } catch (error) {
        throw new Error(`Stronghold store.insert 失败：${getErrorMessage(error)}`)
      }

      try {
        await stronghold.save()
        cachedSecretValue = secret
      } catch (error) {
        throw new Error(`Stronghold.save 失败：${getErrorMessage(error)}`)
      }
    },
    async clearSecret() {
      if (cachedSecretValue === null) {
        return
      }

      const { stronghold, client } = await loadStrongholdClient()

      try {
        const store = client.getStore()
        await store.remove(SECRET_KEY)
      } catch (error) {
        throw new Error(`Stronghold store.remove 失败：${getErrorMessage(error)}`)
      }

      try {
        await stronghold.save()
        cachedSecretValue = null
      } catch (error) {
        throw new Error(`Stronghold.save 失败：${getErrorMessage(error)}`)
      }
    }
  }
}

import type { SettingsStorage } from '@/platform/storage'
import type { UsageApi } from '@/platform/usage-api'
import type { AccountConfig, PollOption, QueryState } from './types'

type Scheduler = {
  setInterval(callback: () => void, ms: number): ReturnType<typeof setInterval>
  clearInterval(id: ReturnType<typeof setInterval>): void
}

type ServiceDeps = {
  storage: SettingsStorage
  usageApi: UsageApi
  now?: () => string
  scheduler?: Scheduler
  profile?: AccountConfig
  form?: AccountConfig
  state?: QueryState
}

const DEFAULT_POLL_INTERVAL = 60_000
const defaultProfile: AccountConfig = { key: '' }

export const pollOptions: PollOption[] = [
  { label: '1 分钟', value: 60_000 },
  { label: '3 分钟', value: 180_000 },
  { label: '5 分钟', value: 300_000 },
  { label: '手动刷新', value: 0 }
]

function createEmptyState(): QueryState {
  return {
    loading: false,
    persistingSecret: false,
    error: '',
    data: null,
    lastUpdated: ''
  }
}

export function createCodexUsageService({
  storage,
  usageApi,
  now = () => new Date().toLocaleString('zh-CN', { hour12: false }),
  scheduler = {
    setInterval: (callback: () => void, ms: number) => globalThis.setInterval(callback, ms),
    clearInterval: (id: ReturnType<typeof setInterval>) => globalThis.clearInterval(id)
  },
  profile: profileState,
  form: formState,
  state: queryState
}: ServiceDeps) {
  const profile: AccountConfig = profileState ?? { ...defaultProfile }
  const form: AccountConfig = formState ?? { ...defaultProfile }
  const state = queryState ?? createEmptyState()

  let pollInterval = DEFAULT_POLL_INTERVAL
  let timer: ReturnType<typeof setInterval> | null = null
  let secretSyncChain = Promise.resolve()
  let pendingSecretSyncCount = 0
  let latestRefreshRequestId = 0

  function hasProfile() {
    return Boolean(profile.key.trim())
  }

  function setSecretPersisting(nextValue: boolean) {
    state.persistingSecret = nextValue
  }

  function scheduleSecretSync(task: () => Promise<void>) {
    pendingSecretSyncCount += 1
    setSecretPersisting(true)

    secretSyncChain = secretSyncChain
      .catch(() => {
        // Keep the queue alive after previous failures.
      })
      .then(task)
      .catch((error) => {
        state.error = error instanceof Error ? `密钥已应用，但本地保存失败：${error.message}` : '密钥已应用，但本地保存失败'
      })
      .finally(() => {
        pendingSecretSyncCount = Math.max(0, pendingSecretSyncCount - 1)
        setSecretPersisting(pendingSecretSyncCount > 0)
      })

    return secretSyncChain
  }

  async function hydrate() {
    const [settings, secret] = await Promise.all([storage.loadSettings(), storage.loadSecret()])
    pollInterval = settings.pollInterval
    const normalizedSecret = (secret || '').trim()
    profile.key = normalizedSecret
    form.key = normalizedSecret
  }

  async function refreshUsage() {
    const accountKey = profile.key.trim()
    if (!accountKey) return

    const requestId = ++latestRefreshRequestId
    state.loading = true
    state.error = ''

    try {
      const result = await usageApi.getUsage(accountKey)
      if (result?.code !== 200 || !result?.state) {
        throw new Error(result?.msg || '接口返回异常')
      }
      if (requestId !== latestRefreshRequestId) {
        return
      }
      state.data = result.state
      state.lastUpdated = now()
    } catch (error) {
      if (requestId !== latestRefreshRequestId) {
        return
      }
      state.error = error instanceof Error ? error.message : '请求失败'
    } finally {
      if (requestId === latestRefreshRequestId) {
        state.loading = false
      }
    }
  }

  function stopPolling() {
    if (timer !== null) {
      scheduler.clearInterval(timer)
      timer = null
    }
  }

  function restartPolling() {
    stopPolling()
    if (!hasProfile() || pollInterval <= 0) return
    timer = scheduler.setInterval(() => {
      if (state.loading) return
      void refreshUsage()
    }, pollInterval)
  }

  async function saveProfile() {
    const trimmedKey = form.key.trim()
    if (!trimmedKey) return false

    state.error = ''
    state.loading = true

    try {
      const secretChanged = trimmedKey !== profile.key.trim()
      profile.key = trimmedKey
      form.key = trimmedKey

      if (secretChanged) {
        void scheduleSecretSync(() => storage.saveSecret(trimmedKey))
      }

      await storage.saveSettings({ pollInterval })

      restartPolling()
      await refreshUsage()
      return true
    } catch (error) {
      state.error = error instanceof Error ? error.message : '保存配置失败'
      return false
    } finally {
      state.loading = false
    }
  }

  async function resetProfile() {
    profile.key = ''
    form.key = ''
    pollInterval = DEFAULT_POLL_INTERVAL

    state.loading = false
    state.persistingSecret = false
    state.error = ''
    state.data = null
    state.lastUpdated = ''

    stopPolling()
    await Promise.all([
      scheduleSecretSync(() => storage.clearSecret()),
      storage.clearSettings()
    ])
  }

  async function setPollInterval(value: number) {
    pollInterval = value
    await storage.saveSettings({ pollInterval: value })
    restartPolling()
  }

  return {
    profile,
    form,
    get pollInterval() {
      return pollInterval
    },
    state,
    hydrate,
    refreshUsage,
    saveProfile,
    resetProfile,
    setPollInterval,
    restartPolling,
    stopPolling
  }
}

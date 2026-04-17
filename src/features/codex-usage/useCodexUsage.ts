import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { platform } from '@/platform'
import { createCodexUsageService, pollOptions } from './service'
import type { AccountConfig, QueryState } from './types'

export function useCodexUsage() {
  const profile = reactive<AccountConfig>({ key: '' })
  const form = reactive<AccountConfig>({ key: '' })
  const state = reactive<QueryState>({
    loading: false,
    persistingSecret: false,
    error: '',
    data: null,
    lastUpdated: ''
  })

  const service = createCodexUsageService({
    storage: platform.storage,
    usageApi: platform.usageApi,
    profile,
    form,
    state
  })

  const pollInterval = ref(service.pollInterval)

  function syncPollInterval() {
    pollInterval.value = service.pollInterval
  }

  async function refreshUsage() {
    await service.refreshUsage()
  }

  async function saveProfile() {
    const saved = await service.saveProfile()
    syncPollInterval()
    return saved
  }

  async function resetProfile() {
    await service.resetProfile()
    syncPollInterval()
  }

  async function setPollInterval(value: number) {
    await service.setPollInterval(value)
    syncPollInterval()
  }

  onMounted(async () => {
    try {
      await service.hydrate()
      syncPollInterval()

      if (profile.key.trim()) {
        await service.refreshUsage()
      }

      service.restartPolling()
    } catch (error) {
      state.error = error instanceof Error ? error.message : '初始化失败'
      syncPollInterval()
    }
  })

  onBeforeUnmount(() => {
    service.stopPolling()
  })

  return {
    profile,
    form,
    state,
    pollInterval,
    pollOptions,
    hasProfile: computed(() => Boolean(profile.key.trim())),
    packageInfo: computed(() => state.data?.package.packages?.[0] || null),
    dailyUsage: computed(() => state.data?.userPackgeUsage || null),
    weeklyUsage: computed(() => state.data?.userPackgeUsage_week || null),
    refreshUsage,
    saveProfile,
    resetProfile,
    setPollInterval
  }
}

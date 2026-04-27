import { nextTick, reactive, watchEffect } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCodexUsageService } from '../service'

describe('codex usage service', () => {
  function createUsageResponse(email = 'demo@example.com') {
    return {
      code: 200,
      state: {
        package: { packages: [] },
        user: { uid: '1', email },
        userPackgeUsage: null,
        userPackgeUsage_week: null,
        userAccountInfo: { total_balance: 0, accountId: null }
      }
    }
  }

  function createStorageMock() {
    return {
      loadSettings: vi.fn().mockResolvedValue({ pollInterval: 60_000 }),
      saveSettings: vi.fn().mockResolvedValue(undefined),
      clearSettings: vi.fn().mockResolvedValue(undefined),
      loadSecret: vi.fn().mockResolvedValue('stored-key'),
      saveSecret: vi.fn().mockResolvedValue(undefined),
      clearSecret: vi.fn().mockResolvedValue(undefined)
    }
  }

  function createUsageApiMock() {
    return {
      getUsage: vi.fn().mockResolvedValue(createUsageResponse())
    }
  }

  let storage: ReturnType<typeof createStorageMock>
  let usageApi: ReturnType<typeof createUsageApiMock>

  beforeEach(() => {
    storage = createStorageMock()
    usageApi = createUsageApiMock()
  })

  it('hydrates stored settings and secret', async () => {
    const service = createCodexUsageService({ storage, usageApi })
    await service.hydrate()
    expect(service.profile.key).toBe('stored-key')
    expect(service.pollInterval).toBe(60_000)
  })

  it('saves a trimmed profile and refreshes immediately', async () => {
    const service = createCodexUsageService({ storage, usageApi })
    service.form.key = '  new-key  '
    await service.saveProfile()
    expect(storage.saveSecret).toHaveBeenCalledWith('new-key')
    expect(usageApi.getUsage).toHaveBeenCalledWith('new-key')
  })

  it('captures API errors as user-facing state', async () => {
    usageApi.getUsage.mockRejectedValueOnce(new Error('boom'))
    const service = createCodexUsageService({ storage, usageApi })
    service.profile.key = 'x'
    await service.refreshUsage()
    expect(service.state.error).toBe('boom')
  })

  it('surfaces background secret persistence failures as user-facing state', async () => {
    storage.saveSecret.mockRejectedValueOnce(new Error('save failed'))
    const service = createCodexUsageService({ storage, usageApi })
    service.form.key = 'new-key'

    await expect(service.saveProfile()).resolves.toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(service.state.error).toBe('密钥已应用，但本地保存失败：save failed')
    expect(service.profile.key).toBe('new-key')
    expect(usageApi.getUsage).toHaveBeenCalledWith('new-key')
  })

  it('marks the save flow as loading before secret persistence finishes', async () => {
    let resolveSaveSecret: (() => void) | null = null
    storage.saveSecret.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSaveSecret = resolve
        })
    )

    const service = createCodexUsageService({ storage, usageApi })
    service.form.key = 'new-key'

    const savePromise = service.saveProfile()
    expect(service.state.loading).toBe(true)

    resolveSaveSecret?.()
    await savePromise

    expect(service.state.loading).toBe(false)
  })

  it('skips secret persistence when saving the same key again', async () => {
    const service = createCodexUsageService({ storage, usageApi })
    service.profile.key = 'same-key'
    service.form.key = 'same-key'

    await expect(service.saveProfile()).resolves.toBe(true)

    expect(storage.saveSecret).not.toHaveBeenCalled()
    expect(storage.saveSettings).toHaveBeenCalledWith({ pollInterval: 60_000 })
    expect(usageApi.getUsage).toHaveBeenCalledWith('same-key')
  })

  it('does not wait for secret persistence before refreshing usage with a new key', async () => {
    let resolveSaveSecret: (() => void) | null = null
    storage.saveSecret.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSaveSecret = resolve
        })
    )

    const service = createCodexUsageService({ storage, usageApi })
    service.form.key = 'fresh-key'

    await expect(service.saveProfile()).resolves.toBe(true)

    expect(service.state.loading).toBe(false)
    expect(service.state.persistingSecret).toBe(true)
    expect(usageApi.getUsage).toHaveBeenCalledWith('fresh-key')

    resolveSaveSecret?.()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(service.state.persistingSecret).toBe(false)
  })

  it('notifies Vue observers when save flow enters loading state', async () => {
    let resolveSaveSecret: (() => void) | null = null
    storage.saveSecret.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSaveSecret = resolve
        })
    )

    const observedState = reactive({
      loading: false,
      error: '',
      data: null,
      lastUpdated: ''
    })
    const service = createCodexUsageService({
      storage,
      usageApi,
      profile: reactive({ key: '' }),
      form: reactive({ key: '' }),
      state: observedState
    })
    const loadingSnapshots: boolean[] = []

    watchEffect(() => {
      loadingSnapshots.push(observedState.loading)
    })

    service.form.key = 'new-key'
    const savePromise = service.saveProfile()
    await nextTick()

    expect(loadingSnapshots).toEqual([false, true])

    resolveSaveSecret?.()
    await savePromise
  })

  it('does not overlap polling refresh requests while one is still running', async () => {
    let resolveUsage: (() => void) | null = null
    usageApi.getUsage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUsage = () =>
            resolve({
              code: 200,
              state: {
                package: { packages: [] },
                user: { uid: '1', email: 'demo@example.com' },
                userPackgeUsage: null,
                userPackgeUsage_week: null,
                userAccountInfo: { total_balance: 0, accountId: null }
              }
            })
        })
    )

    let pollTick: (() => void) | null = null
    const service = createCodexUsageService({
      storage,
      usageApi,
      scheduler: {
        setInterval(callback: () => void) {
          pollTick = callback
          return 1
        },
        clearInterval() {}
      }
    })

    service.profile.key = 'active-key'
    service.restartPolling()
    pollTick?.()
    pollTick?.()

    expect(usageApi.getUsage).toHaveBeenCalledTimes(1)
    expect(resolveUsage).toEqual(expect.any(Function))

    resolveUsage()
    await Promise.resolve()
  })

  it('ignores stale refresh errors from an older key after a newer save succeeds', async () => {
    let resolveOldRefresh: ((value: unknown) => void) | null = null
    let resolveNewRefresh: ((value: unknown) => void) | null = null

    storage.loadSettings.mockResolvedValueOnce({ pollInterval: 60_000 })
    storage.loadSecret.mockResolvedValueOnce('old-key')
    usageApi.getUsage.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOldRefresh = resolve
        })
    )
    usageApi.getUsage.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveNewRefresh = resolve
        })
    )

    const service = createCodexUsageService({ storage, usageApi })
    await service.hydrate()

    const oldRefreshPromise = service.refreshUsage()
    service.form.key = 'new-key'
    const savePromise = service.saveProfile()
    await Promise.resolve()

    resolveNewRefresh?.(createUsageResponse('new@example.com'))
    await savePromise

    resolveOldRefresh?.({
      code: 401,
      msg: '无效的 API 密钥'
    })
    await oldRefreshPromise

    expect(service.profile.key).toBe('new-key')
    expect(service.state.data?.user.email).toBe('new@example.com')
    expect(service.state.error).toBe('')
  })
})

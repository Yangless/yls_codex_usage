import { afterEach, vi } from 'vitest'

afterEach(() => {
  globalThis.localStorage?.clear?.()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

import { afterEach, describe, expect, it } from 'vitest'
import { createWebStorage } from '../storage.web'

describe('web storage adapter', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('persists poll interval separately from the secret key', async () => {
    const storage = createWebStorage()

    await storage.saveSettings({ pollInterval: 180_000 })
    await storage.saveSecret('demo-key')

    expect(await storage.loadSettings()).toEqual({ pollInterval: 180_000 })
    expect(await storage.loadSecret()).toBe('demo-key')
  })

  it('falls back to the default when stored pollInterval is invalid', async () => {
    localStorage.setItem('codex-usage-settings', JSON.stringify({ pollInterval: -1 }))

    const storage = createWebStorage()
    expect(await storage.loadSettings()).toEqual({ pollInterval: 60_000 })
  })

  it('keeps manual refresh interval (0) when loading settings', async () => {
    localStorage.setItem('codex-usage-settings', JSON.stringify({ pollInterval: 0 }))

    const storage = createWebStorage()
    expect(await storage.loadSettings()).toEqual({ pollInterval: 0 })
  })

  it('falls back to default for malformed non-finite pollInterval values', async () => {
    localStorage.setItem('codex-usage-settings', JSON.stringify({ pollInterval: 'NaN' }))
    const storageWithNaN = createWebStorage()
    expect(await storageWithNaN.loadSettings()).toEqual({ pollInterval: 60_000 })

    localStorage.setItem('codex-usage-settings', JSON.stringify({ pollInterval: 'Infinity' }))
    const storageWithInfinity = createWebStorage()
    expect(await storageWithInfinity.loadSettings()).toEqual({ pollInterval: 60_000 })
  })
})

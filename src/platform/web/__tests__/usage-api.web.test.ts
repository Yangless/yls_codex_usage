import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildAuthHeaders, createWebUsageApi } from '../usage-api.web'

describe('web usage api adapter', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('normalizes all required auth headers', () => {
    expect(buildAuthHeaders('abc')).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer abc',
      'x-api-key': 'abc',
      'X-API-Key': 'abc',
      apikey: 'abc',
      key: 'abc'
    })
  })

  it('normalizes api key headers when token starts with Bearer', () => {
    expect(buildAuthHeaders('Bearer token123')).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer token123',
      'x-api-key': 'token123',
      'X-API-Key': 'token123',
      apikey: 'token123',
      key: 'token123'
    })
  })

  it('fetches usage with GET and throws backend message from error responses', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const usageApi = createWebUsageApi()

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue('{"code":401,"msg":"无效的 API 密钥"}')
    })

    await expect(usageApi.getUsage('abc')).rejects.toThrow('无效的 API 密钥')
    expect(fetchMock).toHaveBeenCalledWith('https://code.ylsagi.com/codex/info', expect.objectContaining({
      method: 'GET',
      headers: buildAuthHeaders('abc')
    }))
  })

  it('falls back to HTTP status when error response body has no message', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const usageApi = createWebUsageApi()

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue('server exploded')
    })

    await expect(usageApi.getUsage('abc')).rejects.toThrow('请求失败：HTTP 500')
  })

  it('returns parsed JSON when response is ok', async () => {
    const fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const jsonMock = vi.fn().mockResolvedValue({ code: 0 })
    fetchMock.mockResolvedValueOnce({ ok: true, json: jsonMock })

    const usageApi = createWebUsageApi()
    await expect(usageApi.getUsage('abc')).resolves.toEqual({ code: 0 })
    expect(fetchMock).toHaveBeenCalledWith('https://code.ylsagi.com/codex/info', expect.objectContaining({
      method: 'GET',
      headers: buildAuthHeaders('abc')
    }))
  })
})

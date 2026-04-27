import { CODEX_USAGE_API_URL, getUsageApiErrorMessage, type UsageApi } from '../usage-api'

export function buildAuthHeaders(accountKey: string) {
  const token = String(accountKey || '').trim().replace(/^Bearer\s+/i, '')
  return {
    Authorization: `Bearer ${token}`
  }
}

export function createWebUsageApi(): UsageApi {
  return {
    async getUsage(accountKey) {
      const response = await fetch(CODEX_USAGE_API_URL, { method: 'GET', headers: buildAuthHeaders(accountKey) })
      if (!response.ok) {
        const bodyText = typeof response.text === 'function' ? await response.text() : ''
        throw new Error(getUsageApiErrorMessage(response.status, bodyText))
      }
      return response.json()
    }
  }
}

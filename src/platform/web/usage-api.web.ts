import { getUsageApiErrorMessage, type UsageApi } from '../usage-api'

const API_URL = 'https://code.ylsagi.com/codex/info'

export function buildAuthHeaders(accountKey: string) {
  const normalizedKey = String(accountKey || '').trim()
  const token = normalizedKey.replace(/^Bearer\s+/i, '')
  return {
    Accept: 'application/json',
    Authorization: normalizedKey.startsWith('Bearer ') ? normalizedKey : `Bearer ${normalizedKey}`,
    'x-api-key': token,
    'X-API-Key': token,
    apikey: token,
    key: token
  }
}

export function createWebUsageApi(): UsageApi {
  return {
    async getUsage(accountKey) {
      const response = await fetch(API_URL, { method: 'GET', headers: buildAuthHeaders(accountKey) })
      if (!response.ok) {
        const bodyText = typeof response.text === 'function' ? await response.text() : ''
        throw new Error(getUsageApiErrorMessage(response.status, bodyText))
      }
      return response.json()
    }
  }
}

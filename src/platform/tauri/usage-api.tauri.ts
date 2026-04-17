import { fetch } from '@tauri-apps/plugin-http'
import { getUsageApiErrorMessage, type UsageApi } from '../usage-api'
import { buildAuthHeaders } from '../web/usage-api.web'

const API_URL = 'https://code.ylsagi.com/codex/info'

export function createTauriUsageApi(): UsageApi {
  return {
    async getUsage(accountKey) {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: buildAuthHeaders(accountKey)
      })

      if (!response.ok) {
        const bodyText = typeof response.text === 'function' ? await response.text() : ''
        throw new Error(getUsageApiErrorMessage(response.status, bodyText))
      }

      return response.json()
    }
  }
}

import { fetch } from '@tauri-apps/plugin-http'
import { CODEX_USAGE_API_URL, getUsageApiErrorMessage, type UsageApi } from '../usage-api'
import { buildAuthHeaders } from '../web/usage-api.web'

export function createTauriUsageApi(): UsageApi {
  return {
    async getUsage(accountKey) {
      const response = await fetch(CODEX_USAGE_API_URL, {
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

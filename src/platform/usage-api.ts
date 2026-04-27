import type { ApiState } from '@/features/codex-usage/types'

export const CODEX_USAGE_API_URL = 'https://codex.ylsagi.com/codex/info'

export type CodexUsageResponse = { code: number; msg?: string; state?: ApiState }

export interface UsageApi {
  getUsage(accountKey: string): Promise<CodexUsageResponse>
}

export function getUsageApiErrorMessage(status: number, bodyText: string | null | undefined) {
  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText) as { msg?: string }
      if (parsed?.msg) {
        return parsed.msg
      }
    } catch {
      // Fall back to the HTTP status when the response body is not JSON.
    }
  }

  return `请求失败：HTTP ${status}`
}

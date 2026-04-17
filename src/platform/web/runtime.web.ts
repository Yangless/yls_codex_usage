import type { RuntimeInfo } from '../runtime'

export function createWebRuntime(): RuntimeInfo {
  return {
    getPlatform() {
      return 'web'
    },
    isTauri() {
      return false
    }
  }
}

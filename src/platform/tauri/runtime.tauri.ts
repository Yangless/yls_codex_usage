import { platform as tauriPlatform } from '@tauri-apps/plugin-os'
import type { RuntimeInfo } from '../runtime'

export function createTauriRuntime(): RuntimeInfo {
  return {
    getPlatform() {
      const current = tauriPlatform()
      if (current === 'ios') return 'ios'
      if (current === 'linux') return 'linux'
      if (current === 'windows') return 'windows'
      if (current === 'macos') return 'macos'
      if (current === 'android') return 'android'
      return 'web'
    },
    isTauri() {
      return true
    }
  }
}

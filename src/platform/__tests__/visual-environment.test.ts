import { describe, expect, it } from 'vitest'
import { applyVisualEnvironment, getVisualEnvironment } from '../visual-environment'
import type { RuntimeInfo } from '../runtime'

function createRuntime(platform: RuntimeInfo['getPlatform'] extends () => infer T ? T : never, isTauri = true): RuntimeInfo {
  return {
    getPlatform() {
      return platform
    },
    isTauri() {
      return isTauri
    }
  }
}

describe('visual environment', () => {
  it('reduces glass effects for tauri linux', () => {
    expect(getVisualEnvironment(createRuntime('linux'))).toEqual({
      platform: 'linux',
      reduceTransparency: true
    })
  })

  it('keeps glass effects on windows', () => {
    expect(getVisualEnvironment(createRuntime('windows'))).toEqual({
      platform: 'windows',
      reduceTransparency: false
    })
  })

  it('applies platform and reduced-effects flags to the document root', () => {
    applyVisualEnvironment(document, createRuntime('linux'))

    expect(document.documentElement.dataset.platform).toBe('linux')
    expect(document.documentElement.dataset.effects).toBe('reduced')
  })
})

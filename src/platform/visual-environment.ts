import type { RuntimeInfo } from './runtime'

export interface VisualEnvironment {
  platform: RuntimeInfo['getPlatform'] extends () => infer T ? T : never
  reduceTransparency: boolean
}

export function getVisualEnvironment(runtime: RuntimeInfo): VisualEnvironment {
  const platform = runtime.getPlatform()

  return {
    platform,
    reduceTransparency: runtime.isTauri() && platform === 'linux'
  }
}

export function applyVisualEnvironment(document: Document, runtime: RuntimeInfo): VisualEnvironment {
  const environment = getVisualEnvironment(runtime)

  document.documentElement.dataset.platform = environment.platform

  if (environment.reduceTransparency) {
    document.documentElement.dataset.effects = 'reduced'
  } else {
    delete document.documentElement.dataset.effects
  }

  return environment
}

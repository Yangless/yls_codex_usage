export interface RuntimeInfo {
  getPlatform(): 'web' | 'windows' | 'linux' | 'ios' | 'macos' | 'android'
  isTauri(): boolean
}

import { createTauriRuntime } from './tauri/runtime.tauri'
import { createTauriStorage } from './tauri/storage.tauri'
import { createTauriUsageApi } from './tauri/usage-api.tauri'

export const platform = {
  runtime: createTauriRuntime(),
  storage: createTauriStorage(),
  usageApi: createTauriUsageApi()
}

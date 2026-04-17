export type AccountConfig = {
  key: string
}

export type UsageMetrics = {
  input_tokens: number
  input_tokens_cached: number
  output_tokens: number
  output_tokens_reasoning: number
  total_tokens: number
  input_cost: number
  output_cost: number
  cache_read_cost: number
  total_cost: number
  request_count: number
  total_quota: number
  remaining_quota: number
  used_percentage: string
}

export type PackageInfo = {
  total_quota: number
  weeklyQuota: number
  packages: Array<{
    _id: string
    package_type: string
    package_quota: number
    start_at: string
    expires_at: string
    amount: number
    sub_type: string
  }>
  cache: boolean
  package_level: number
}

export type ApiState = {
  toDay: string
  user: {
    uid: string
    email: string
  }
  package: PackageInfo
  userPackgeUsage_week: UsageMetrics
  userPackgeUsage: UsageMetrics
  userAccountInfo: {
    total_balance: number
    accountId: string | null
  }
}

export type QueryState = {
  loading: boolean
  persistingSecret: boolean
  error: string
  data: ApiState | null
  lastUpdated: string
}

export type PollOption = {
  label: string
  value: number
}

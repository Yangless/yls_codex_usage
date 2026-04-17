import type { PackageInfo, UsageMetrics } from './types'

export function formatCurrency(value: number | string | undefined) {
  const num = Number(value || 0)
  return `$${num.toFixed(2)}`
}

export function formatPercent(value: number | string | undefined) {
  const num = Number(String(value || 0).replace('%', ''))
  const clamped = Math.max(0, Math.min(100, num))
  return `${clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}%`
}

export function formatToken(value: number | undefined) {
  const num = Number(value || 0)
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)} B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)} M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)} K`
  return num.toLocaleString('zh-CN')
}

export function formatDate(value: string | undefined) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function getRemainingDays(expiresAt: string | undefined) {
  if (!expiresAt) return '--'
  const expires = new Date(expiresAt).getTime()
  if (Number.isNaN(expires)) return '--'
  const diff = Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000))
  return `${Math.max(diff, 0)} 天`
}

export function getPackageTitle(pkg: PackageInfo['packages'][number] | null) {
  if (!pkg) return '暂无订阅信息'
  return `${pkg.package_type || 'Codex'} ${pkg.sub_type || '订阅'}`
}

export function getQuotaRatio(metrics: UsageMetrics | null | undefined) {
  if (!metrics) return 0
  const num = Number(String(metrics.used_percentage || 0).replace('%', ''))
  return Math.max(0, Math.min(100, num))
}

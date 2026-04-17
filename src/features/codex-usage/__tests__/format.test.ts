import { describe, expect, it } from 'vitest'
import { formatCurrency, formatPercent, formatToken, getRemainingDays } from '../format'

describe('codex usage format helpers', () => {
  it('formats currency with two decimals', () => {
    expect(formatCurrency(12.5)).toBe('$12.50')
  })

  it('clamps percentage output', () => {
    expect(formatPercent('102.44%')).toBe('100%')
    expect(formatPercent('19.5%')).toBe('19.5%')
  })

  it('formats token counts into compact units', () => {
    expect(formatToken(1_250)).toBe('1.25 K')
    expect(formatToken(2_200_000)).toBe('2.20 M')
  })

  it('never reports negative remaining days', () => {
    expect(getRemainingDays('2000-01-01T00:00:00.000Z')).toBe('0 天')
  })
})

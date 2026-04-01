import { describe, it, expect } from 'vitest'
import { getTradingDay, getTradingDayStr } from '@/utils/date-helpers'

/**
 * Trading Day Cycle:
 * - Market opens at 05:00 AM Thai Time (GMT+7)
 * - Market closes at 04:59 AM Thai Time (next calendar day)
 * - The 5-hour offset means trades between 00:00-04:59 belong to the PREVIOUS day.
 *
 * Implementation: subtract 5 hours before extracting YYYY-MM-DD in Asia/Bangkok.
 */

// Helper: create a Date from Thai time components.
// Thai time is UTC+7, so to get a specific Thai time we subtract 7 hours.
function thaiTime(year: number, month: number, day: number, hour: number, minute = 0): Date {
    return new Date(Date.UTC(year, month - 1, day, hour - 7, minute))
}

describe('getTradingDayStr', () => {
    it('afternoon trade stays on the same day', () => {
        // Monday 14:00 Thai time → Monday
        const d = thaiTime(2026, 3, 23, 14, 0) // Monday 2026-03-23 14:00 TH
        expect(getTradingDayStr(d)).toBe('2026-03-23')
    })

    it('01:00 AM Tuesday belongs to Monday (before 05:00 reset)', () => {
        const d = thaiTime(2026, 3, 24, 1, 0) // Tuesday 01:00 TH
        expect(getTradingDayStr(d)).toBe('2026-03-23') // Monday
    })

    it('04:59 AM Tuesday still belongs to Monday', () => {
        const d = thaiTime(2026, 3, 24, 4, 59)
        expect(getTradingDayStr(d)).toBe('2026-03-23')
    })

    it('05:00 AM Tuesday starts a new trading day (Tuesday)', () => {
        const d = thaiTime(2026, 3, 24, 5, 0)
        expect(getTradingDayStr(d)).toBe('2026-03-24')
    })

    it('05:01 AM Tuesday is Tuesday', () => {
        const d = thaiTime(2026, 3, 24, 5, 1)
        expect(getTradingDayStr(d)).toBe('2026-03-24')
    })

    it('handles month boundary: April 1 02:00 AM → March 31', () => {
        const d = thaiTime(2026, 4, 1, 2, 0)
        expect(getTradingDayStr(d)).toBe('2026-03-31')
    })

    it('handles year boundary: Jan 1 03:00 AM → Dec 31 previous year', () => {
        const d = thaiTime(2027, 1, 1, 3, 0)
        expect(getTradingDayStr(d)).toBe('2026-12-31')
    })

    it('midnight exactly belongs to previous trading day', () => {
        // 00:00 means the market cycle hasn't reset yet (reset is at 05:00)
        const d = thaiTime(2026, 3, 24, 0, 0) // Tuesday midnight
        expect(getTradingDayStr(d)).toBe('2026-03-23') // Monday
    })
})

describe('getTradingDay', () => {
    it('returns midnight UTC of the trading day', () => {
        const d = thaiTime(2026, 3, 23, 14, 0) // Monday 14:00 TH
        const result = getTradingDay(d)
        expect(result.toISOString()).toBe('2026-03-23T00:00:00.000Z')
    })

    it('01:00 AM is previous trading day midnight', () => {
        const d = thaiTime(2026, 3, 24, 1, 0) // Tuesday 01:00 TH
        const result = getTradingDay(d)
        expect(result.toISOString()).toBe('2026-03-23T00:00:00.000Z') // Monday midnight
    })

    it('accepts ISO string input', () => {
        // 2026-03-24T01:00:00+07:00 = Tuesday 01:00 TH = Monday trading day
        const result = getTradingDay('2026-03-23T18:00:00.000Z') // This is 01:00 TH on Mar 24
        expect(result.toISOString()).toBe('2026-03-23T00:00:00.000Z')
    })
})

import { describe, it, expect } from 'vitest'
import {
    calculateNetProfit,
    calculatePoints,
    buildCommissionMap,
    getCommission,
    enrichTradesWithNet,
    calculateTradeStats,
    type TradeInput,
    type TradeWithNet,
} from '@/lib/trade-calculations'

// ─── calculateNetProfit ─────────────────────────────────────────────

describe('calculateNetProfit', () => {
    it('subtracts commission correctly', () => {
        // $100 profit, 0.5 lots, $4/lot commission → $100 - $2 = $98
        expect(calculateNetProfit(100, 0.5, 4)).toBe(98)
    })

    it('returns gross profit when commission is 0', () => {
        expect(calculateNetProfit(50, 1.0, 0)).toBe(50)
    })

    it('handles negative profit (loss becomes worse)', () => {
        // -$20 loss, 1 lot, $3 commission → -$20 - $3 = -$23
        expect(calculateNetProfit(-20, 1.0, 3)).toBe(-23)
    })

    it('handles zero lot size', () => {
        expect(calculateNetProfit(100, 0, 5)).toBe(100)
    })
})

// ─── calculatePoints ────────────────────────────────────────────────

describe('calculatePoints', () => {
    it('calculates points as profit / lot_size', () => {
        expect(calculatePoints(100, 0.5)).toBe(200)
    })

    it('rounds to nearest integer', () => {
        expect(calculatePoints(33, 0.5)).toBe(66)
    })

    it('returns 0 when lot size is 0', () => {
        expect(calculatePoints(100, 0)).toBe(0)
    })

    it('handles negative profit', () => {
        expect(calculatePoints(-50, 0.25)).toBe(-200)
    })
})

// ─── buildCommissionMap & getCommission ──────────────────────────────

describe('buildCommissionMap', () => {
    it('sets profile default on null key', () => {
        const map = buildCommissionMap(5, [])
        expect(map.get(null)).toBe(5)
    })

    it('sets portfolio-specific commissions', () => {
        const portfolios = [
            { id: 'p1', commission_per_lot: 3 },
            { id: 'p2', commission_per_lot: 7 },
        ]
        const map = buildCommissionMap(5, portfolios)
        expect(map.get('p1')).toBe(3)
        expect(map.get('p2')).toBe(7)
    })

    it('falls back to profile commission when portfolio commission is null', () => {
        const portfolios = [{ id: 'p1', commission_per_lot: null }]
        const map = buildCommissionMap(5, portfolios)
        expect(map.get('p1')).toBe(5) // fallback
    })
})

describe('getCommission', () => {
    it('returns portfolio-specific commission', () => {
        const map = new Map<string | null, number>([['p1', 3], [null, 5]])
        expect(getCommission(map, 'p1')).toBe(3)
    })

    it('falls back to null key for unknown portfolio', () => {
        const map = new Map<string | null, number>([[null, 5]])
        expect(getCommission(map, 'unknown')).toBe(5)
    })

    it('returns 0 if nothing matches', () => {
        const map = new Map<string | null, number>()
        expect(getCommission(map, 'unknown')).toBe(0)
    })
})

// ─── enrichTradesWithNet ────────────────────────────────────────────

describe('enrichTradesWithNet', () => {
    it('adds net_profit and commission_applied fields', () => {
        const trades: TradeInput[] = [
            { profit: 100, lot_size: 0.5, type: 'BUY', portfolio_id: 'p1' },
        ]
        const map = new Map<string | null, number>([['p1', 4], [null, 0]])
        const result = enrichTradesWithNet(trades, map)

        expect(result).toHaveLength(1)
        expect(result[0].net_profit).toBe(98) // 100 - (0.5 * 4)
        expect(result[0].commission_applied).toBe(4)
    })

    it('handles null profit and lot_size', () => {
        const trades: TradeInput[] = [
            { profit: null, lot_size: null, type: 'BUY' },
        ]
        const map = new Map<string | null, number>([[null, 3]])
        const result = enrichTradesWithNet(trades, map)

        expect(result[0].net_profit).toBe(0) // 0 - (0 * 3) = 0
    })
})

// ─── calculateTradeStats ────────────────────────────────────────────

describe('calculateTradeStats', () => {
    it('returns zero stats for empty trades', () => {
        const stats = calculateTradeStats([])
        expect(stats.totalTrades).toBe(0)
        expect(stats.winRate).toBe('0.0')
        expect(stats.netProfit).toBe('0.00')
        expect(stats.profitFactor).toBe('0.00')
    })

    it('calculates stats for all winning trades', () => {
        const trades: TradeWithNet[] = [
            { profit: 100, lot_size: 1, type: 'BUY', net_profit: 97, commission_applied: 3 },
            { profit: 50, lot_size: 0.5, type: 'BUY', net_profit: 48.5, commission_applied: 3 },
        ]
        const stats = calculateTradeStats(trades)
        expect(stats.totalTrades).toBe(2)
        expect(stats.winRate).toBe('100.0')
        expect(stats.profitFactor).toBe('∞') // no losses → infinity
        expect(Number(stats.netProfit)).toBeCloseTo(145.5)
    })

    it('calculates stats for all losing trades', () => {
        const trades: TradeWithNet[] = [
            { profit: -30, lot_size: 1, type: 'SELL', net_profit: -33, commission_applied: 3 },
            { profit: -20, lot_size: 1, type: 'SELL', net_profit: -23, commission_applied: 3 },
        ]
        const stats = calculateTradeStats(trades)
        expect(stats.winRate).toBe('0.0')
        expect(stats.profitFactor).toBe('0.00')
        expect(Number(stats.netProfit)).toBeCloseTo(-56)
    })

    it('calculates mixed win/loss correctly', () => {
        const trades: TradeWithNet[] = [
            { profit: 100, lot_size: 1, type: 'BUY', net_profit: 100, commission_applied: 0 },
            { profit: -40, lot_size: 1, type: 'SELL', net_profit: -40, commission_applied: 0 },
            { profit: 60, lot_size: 1, type: 'BUY', net_profit: 60, commission_applied: 0 },
        ]
        const stats = calculateTradeStats(trades)
        expect(stats.totalTrades).toBe(3)
        expect(stats.winRate).toBe('66.7') // 2/3
        expect(Number(stats.profitFactor)).toBeCloseTo(4.0) // 160/40
        expect(Number(stats.netProfit)).toBeCloseTo(120) // 100 - 40 + 60
        expect(Number(stats.averageWin)).toBeCloseTo(80) // (100+60)/2
        expect(Number(stats.averageLoss)).toBeCloseTo(40) // 40/1
    })

    it('treats breakeven trades as neither win nor loss', () => {
        const trades: TradeWithNet[] = [
            { profit: 0, lot_size: 1, type: 'BUY', net_profit: 0, commission_applied: 0 },
            { profit: 0.005, lot_size: 1, type: 'BUY', net_profit: 0.005, commission_applied: 0 },
        ]
        const stats = calculateTradeStats(trades)
        expect(stats.winRate).toBe('0.0') // neither are wins (below 0.01 threshold)
    })

    it('correctly splits long (BUY) and short (SELL) stats', () => {
        const trades: TradeWithNet[] = [
            { profit: 100, lot_size: 1, type: 'BUY', net_profit: 100, commission_applied: 0 },
            { profit: -20, lot_size: 1, type: 'BUY', net_profit: -20, commission_applied: 0 },
            { profit: 50, lot_size: 1, type: 'SELL', net_profit: 50, commission_applied: 0 },
        ]
        const stats = calculateTradeStats(trades)

        expect(stats.longStats.count).toBe(2)
        expect(stats.longStats.winRate).toBe('50.0')
        expect(Number(stats.longStats.profit)).toBeCloseTo(80)

        expect(stats.shortStats.count).toBe(1)
        expect(stats.shortStats.winRate).toBe('100.0')
        expect(Number(stats.shortStats.profit)).toBeCloseTo(50)
    })

    it('calculates totalLots correctly', () => {
        const trades: TradeWithNet[] = [
            { profit: 10, lot_size: 0.5, type: 'BUY', net_profit: 10, commission_applied: 0 },
            { profit: 20, lot_size: 1.5, type: 'SELL', net_profit: 20, commission_applied: 0 },
            { profit: -5, lot_size: 0.25, type: 'BUY', net_profit: -5, commission_applied: 0 },
        ]
        const stats = calculateTradeStats(trades)
        expect(stats.totalLots).toBe('2.25')
    })
})

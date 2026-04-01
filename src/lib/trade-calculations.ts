/**
 * Pure functions for trade statistics calculation.
 * These are extracted from api/dashboard/route.ts and dashboard/actions.ts
 * so they can be tested independently and reused consistently.
 */

import type { DashboardStats } from '@/types/models'

// ─── Types ───────────────────────────────────────────────────────────

export type TradeInput = {
    profit: number | null
    lot_size: number | null
    type: string | null
    portfolio_id?: string | null
}

export type TradeWithNet = TradeInput & {
    net_profit: number
    commission_applied: number
}

// ─── Core Calculations ──────────────────────────────────────────────

/**
 * Calculate net profit after commission.
 * Formula: grossProfit - (lotSize × commissionPerLot)
 */
export function calculateNetProfit(
    grossProfit: number,
    lotSize: number,
    commissionPerLot: number
): number {
    return grossProfit - (lotSize * commissionPerLot)
}

/**
 * Calculate points from profit and lot size.
 * Points = |profit / lot_size|, rounded to nearest integer.
 */
export function calculatePoints(profit: number, lotSize: number): number {
    if (lotSize === 0) return 0
    return Math.round(profit / lotSize)
}

// ─── Commission Map ─────────────────────────────────────────────────

export type CommissionSource = {
    id?: string | null
    commission_per_lot?: number | null
}

/**
 * Build a lookup map: portfolio_id → commission_per_lot.
 * null key = profile default (fallback).
 */
export function buildCommissionMap(
    profileCommission: number,
    portfolios: CommissionSource[]
): Map<string | null, number> {
    const map = new Map<string | null, number>()
    map.set(null, profileCommission)
    for (const p of portfolios) {
        if (p.id) {
            map.set(p.id, p.commission_per_lot ?? profileCommission)
        }
    }
    return map
}

/**
 * Get commission for a specific portfolio, falling back to profile default.
 */
export function getCommission(
    map: Map<string | null, number>,
    portfolioId: string | null
): number {
    return map.get(portfolioId) ?? map.get(null) ?? 0
}

// ─── Enrich Trades ──────────────────────────────────────────────────

/**
 * Enrich raw trades with net_profit and commission_applied.
 */
export function enrichTradesWithNet(
    trades: TradeInput[],
    commissionMap: Map<string | null, number>
): TradeWithNet[] {
    return trades.map(t => {
        const gross = t.profit ?? 0
        const lots = t.lot_size ?? 0
        const commission = getCommission(commissionMap, t.portfolio_id ?? null)
        const net = calculateNetProfit(gross, lots, commission)
        return { ...t, net_profit: net, commission_applied: commission }
    })
}

// ─── Stats Calculation ──────────────────────────────────────────────

/**
 * Threshold for considering a trade as breakeven.
 * Trades with |net_profit| <= this value are treated as breakeven,
 * not counted as wins or losses.
 */
const BE_THRESHOLD = 0.01

/**
 * Calculate full dashboard stats from an array of trades with net profit.
 * This is the single source of truth for win rate, profit factor, etc.
 */
export function calculateTradeStats(trades: TradeWithNet[]): DashboardStats {
    const totalTrades = trades.length

    if (totalTrades === 0) {
        return {
            totalTrades: 0,
            winRate: '0.0',
            netProfit: '0.00',
            profitFactor: '0.00',
            averageWin: '0.00',
            averageLoss: '0.00',
            totalLots: '0.00',
            longStats: { count: 0, winRate: '0.0', profit: '0.00' },
            shortStats: { count: 0, winRate: '0.0', profit: '0.00' },
        }
    }

    const winTrades = trades.filter(t => t.net_profit > BE_THRESHOLD)
    const lossTrades = trades.filter(t => t.net_profit < -BE_THRESHOLD)

    const totalNetProfit = trades.reduce((s, t) => s + t.net_profit, 0)
    const grossWin = winTrades.reduce((s, t) => s + t.net_profit, 0)
    const grossLoss = Math.abs(lossTrades.reduce((s, t) => s + t.net_profit, 0))

    const winRate = ((winTrades.length / totalTrades) * 100).toFixed(1)
    const profitFactor = grossLoss > 0
        ? (grossWin / grossLoss).toFixed(2)
        : (grossWin > 0 ? '∞' : '0.00')
    const averageWin = winTrades.length > 0
        ? (grossWin / winTrades.length).toFixed(2)
        : '0.00'
    const averageLoss = lossTrades.length > 0
        ? (grossLoss / lossTrades.length).toFixed(2)
        : '0.00'
    const totalLots = trades.reduce((s, t) => s + (t.lot_size ?? 0), 0).toFixed(2)

    // Long vs Short
    const longTrades = trades.filter(t => t.type === 'BUY')
    const shortTrades = trades.filter(t => t.type === 'SELL')

    function sideStats(side: TradeWithNet[]) {
        const count = side.length
        const wins = side.filter(t => t.net_profit > BE_THRESHOLD).length
        const wr = count > 0 ? ((wins / count) * 100).toFixed(1) : '0.0'
        const profit = side.reduce((s, t) => s + t.net_profit, 0).toFixed(2)
        return { count, winRate: wr, profit }
    }

    return {
        totalTrades,
        winRate,
        netProfit: totalNetProfit.toFixed(2),
        profitFactor,
        averageWin,
        averageLoss,
        totalLots,
        longStats: sideStats(longTrades),
        shortStats: sideStats(shortTrades),
    }
}

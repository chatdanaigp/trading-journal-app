'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfMonth, endOfMonth, subMonths, isSameDay } from 'date-fns'

export type AnalyticsData = {
    stats: {
        netProfit: number
        winRate: number
        profitFactor: number
        maxDrawdown: number
        totalTrades: number
        avgWin: number
        avgLoss: number
        expectancy: number
    }
    equityCurve: {
        date: string
        profit: number
        drawdown: number
    }[]
    assetPerformance: {
        symbol: string
        profit: number
        count: number
        winRate: number
    }[]
    winRateDistribution: {
        name: string
        value: number
        color: string
    }[]
}

export async function getAnalyticsData(range: string = 'all'): Promise<AnalyticsData> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // 1. Fetch Trades
    let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }) // Oldest first for Equity Curve

    // Simple date filtering (can be expanded)
    if (range === 'month') {
        const start = startOfMonth(new Date()).toISOString()
        query = query.gte('created_at', start)
    }

    const { data: trades, error } = await query

    if (error || !trades) {
        console.error('Error fetching analytics trades:', error)
        return {
            stats: { netProfit: 0, winRate: 0, profitFactor: 0, maxDrawdown: 0, totalTrades: 0, avgWin: 0, avgLoss: 0, expectancy: 0 },
            equityCurve: [],
            assetPerformance: [],
            winRateDistribution: []
        }
    }

    // 2. Calculate Stats
    let netProfit = 0
    let grossWin = 0
    let grossLoss = 0
    let winCount = 0
    let lossCount = 0
    let maxDrawdown = 0
    let peakEquity = 0

    // For Asset Stats
    const assetMap = new Map<string, { profit: number, count: number, wins: number }>()

    // For Equity Curve
    const equityCurve = trades.map(trade => {
        const profit = Number(trade.profit) || 0
        netProfit += profit

        if (profit > 0) {
            grossWin += profit
            winCount++
            // Asset Stats
            const asset = assetMap.get(trade.symbol) || { profit: 0, count: 0, wins: 0 }
            asset.profit += profit
            asset.count++
            asset.wins++
            assetMap.set(trade.symbol, asset)
        } else {
            grossLoss += Math.abs(profit)
            lossCount += (profit < 0 ? 1 : 0) // Breakeven is not loss? Let's count < 0 as loss for simplicity
            // Asset Stats
            const asset = assetMap.get(trade.symbol) || { profit: 0, count: 0, wins: 0 }
            asset.profit += profit
            asset.count++
            assetMap.set(trade.symbol, asset)
        }

        // Drawdown Calc
        if (netProfit > peakEquity) {
            peakEquity = netProfit
        }
        const currentDrawdown = peakEquity - netProfit
        if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown
        }

        return {
            date: new Date(trade.created_at).toLocaleDateString(),
            profit: netProfit,
            drawdown: currentDrawdown
        }
    })

    const totalTrades = trades.length
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin // Avoid Infinity
    const avgWin = winCount > 0 ? grossWin / winCount : 0
    const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0
    // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss) -> Simplified
    // Actually: (Avg Win * Win Rate) - (Avg Loss * Loss Rate)
    // Loss Rate = 1 - (Win Rate/100) or just lossCount/total
    const lossRate = totalTrades > 0 ? lossCount / totalTrades : 0
    const expectancy = (avgWin * (winRate / 100)) - (avgLoss * lossRate)

    // 3. Asset Performance Array
    const assetPerformance = Array.from(assetMap.entries()).map(([symbol, data]) => ({
        symbol,
        profit: data.profit,
        count: data.count,
        winRate: (data.wins / data.count) * 100
    })).sort((a, b) => b.profit - a.profit) // Best performers first

    // 4. Win Rate Distribution
    const winRateDistribution = [
        { name: 'Win', value: winCount, color: '#ccf381' },
        { name: 'Loss', value: lossCount, color: '#ef4444' }, // Red-500
        { name: 'Breakeven', value: totalTrades - winCount - lossCount, color: '#9ca3af' } // Gray-400
    ].filter(d => d.value > 0)

    return {
        stats: {
            netProfit,
            winRate,
            profitFactor,
            maxDrawdown, // This is in $ absolute
            totalTrades,
            avgWin,
            avgLoss,
            expectancy
        },
        equityCurve,
        assetPerformance,
        winRateDistribution
    }
}

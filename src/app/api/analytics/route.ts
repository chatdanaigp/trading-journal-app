import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getTradingDayStr, getTradingDay } from '@/utils/date-helpers'
import { buildCommissionMap, getCommission } from '@/lib/trade-calculations'

type TradeRow = {
    created_at: string
    symbol: string
    strategy: string | null
    portfolio_id: string | null
    profit: number | null
    lot_size: number | null
}

function calculateAnalytics(trades: TradeRow[]) {
    let netProfit = 0
    let grossWin = 0
    let grossLoss = 0
    let winCount = 0
    let lossCount = 0
    let maxDrawdown = 0
    let peakEquity = 0
    const assetMap = new Map<string, { profit: number; count: number; wins: number }>()

    const sessionMap = new Map<string, { profit: number; count: number; wins: number }>()
    const strategyMap = new Map<string, { profit: number; count: number; wins: number }>()
    const dayMap = new Map<number, { profit: number; count: number; wins: number; dayName: string }>()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    let currentStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0
    let streakType: 'win' | 'loss' | null = null

    const equityCurve = trades.map((trade) => {
        const profit = Number(trade.profit) || 0
        netProfit += profit

        if (profit > 0) {
            grossWin += profit
            winCount++
        } else {
            grossLoss += Math.abs(profit)
            if (profit < 0) lossCount++
        }

        const asset = assetMap.get(trade.symbol) || { profit: 0, count: 0, wins: 0 }
        asset.profit += profit
        asset.count++
        if (profit > 0) asset.wins++
        assetMap.set(trade.symbol, asset)

        if (netProfit > peakEquity) peakEquity = netProfit
        const currentDrawdown = peakEquity - netProfit
        if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown

        const tradeDate = new Date(trade.created_at)
        const utcHour = tradeDate.getUTCHours()
        let session = 'Off-hours'
        if (utcHour >= 0 && utcHour < 8) session = 'Asian'
        else if (utcHour >= 7 && utcHour < 16) session = 'London'
        else if (utcHour >= 13 && utcHour < 22) session = 'New York'

        const sessionStats = sessionMap.get(session) || { profit: 0, count: 0, wins: 0 }
        sessionStats.profit += profit
        sessionStats.count++
        if (profit > 0) sessionStats.wins++
        sessionMap.set(session, sessionStats)

        if (trade.strategy) {
            const strategyStats = strategyMap.get(trade.strategy) || { profit: 0, count: 0, wins: 0 }
            strategyStats.profit += profit
            strategyStats.count++
            if (profit > 0) strategyStats.wins++
            strategyMap.set(trade.strategy, strategyStats)
        }

        const tradingDay = getTradingDay(trade.created_at)
        const dow = tradingDay.getDay()
        const dayStats = dayMap.get(dow) || { profit: 0, count: 0, wins: 0, dayName: dayNames[dow] }
        dayStats.profit += profit
        dayStats.count++
        if (profit > 0) dayStats.wins++
        dayMap.set(dow, dayStats)

        if (profit > 0) {
            if (streakType === 'win') currentStreak++
            else {
                currentStreak = 1
                streakType = 'win'
            }
            if (currentStreak > maxWinStreak) maxWinStreak = currentStreak
        } else if (profit < 0) {
            if (streakType === 'loss') currentStreak++
            else {
                currentStreak = 1
                streakType = 'loss'
            }
            if (currentStreak > maxLossStreak) maxLossStreak = currentStreak
        }

        return { date: getTradingDayStr(trade.created_at), profit: netProfit, drawdown: currentDrawdown }
    })

    const totalTrades = trades.length
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin
    const avgWin = winCount > 0 ? grossWin / winCount : 0
    const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0
    const lossRate = totalTrades > 0 ? lossCount / totalTrades : 0
    const expectancy = (avgWin * (winRate / 100)) - (avgLoss * lossRate)

    const assetPerformance = Array.from(assetMap.entries())
        .map(([symbol, data]) => ({
            symbol,
            profit: data.profit,
            count: data.count,
            winRate: (data.wins / data.count) * 100,
        }))
        .sort((a, b) => b.profit - a.profit)

    const winRateDistribution = [
        { name: 'Win', value: winCount, color: '#ccf381' },
        { name: 'Loss', value: lossCount, color: '#ef4444' },
        { name: 'Breakeven', value: totalTrades - winCount - lossCount, color: '#9ca3af' },
    ].filter((d) => d.value > 0)

    const sessionPerformance = Array.from(sessionMap.entries())
        .map(([session, data]) => ({
            session,
            profit: Math.round(data.profit * 100) / 100,
            count: data.count,
            winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
        }))
        .sort((a, b) => b.profit - a.profit)

    const strategyPerformance = Array.from(strategyMap.entries())
        .map(([strategy, data]) => ({
            strategy,
            profit: Math.round(data.profit * 100) / 100,
            count: data.count,
            winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
        }))
        .sort((a, b) => b.profit - a.profit)

    const dayOfWeekPerformance = [1, 2, 3, 4, 5].map((dow) => {
        const data = dayMap.get(dow) || { profit: 0, count: 0, wins: 0, dayName: dayNames[dow] }
        return {
            day: data.dayName,
            profit: Math.round(data.profit * 100) / 100,
            count: data.count,
            winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
        }
    })

    return {
        stats: { netProfit, winRate, profitFactor, maxDrawdown, totalTrades, avgWin, avgLoss, expectancy },
        equityCurve,
        assetPerformance,
        winRateDistribution,
        sessionPerformance,
        strategyPerformance,
        dayOfWeekPerformance,
        streaks: { maxWinStreak, maxLossStreak },
    }
}

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
        .from('profiles')
        .select('commission_per_lot')
        .eq('id', user.id)
        .single()

    const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id, commission_per_lot')
        .eq('user_id', user.id)

    const commissionMap = buildCommissionMap(
        (profile as { commission_per_lot: number | null } | null)?.commission_per_lot || 0,
        ((portfolios || []) as { id: string; commission_per_lot: number | null }[]).map(p => ({ id: p.id, commission_per_lot: p.commission_per_lot }))
    )

    const todayStr = getTradingDayStr(new Date())
    const currentMonthPrefix = todayStr.substring(0, 7)
    const currentYearPrefix = todayStr.substring(0, 4)

    const { data: allTradesRaw, error } = await supabase
        .from('trades')
        .select('created_at, symbol, strategy, portfolio_id, profit, lot_size')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (error || !allTradesRaw) {
        const emptyData = {
            stats: { netProfit: 0, winRate: 0, profitFactor: 0, maxDrawdown: 0, totalTrades: 0, avgWin: 0, avgLoss: 0, expectancy: 0 },
            equityCurve: [],
            assetPerformance: [],
            winRateDistribution: [],
        }
        return NextResponse.json({ monthlyData: emptyData, yearlyData: emptyData })
    }

    const allTrades = (allTradesRaw as TradeRow[]).map((trade) => {
        const commission = getCommission(commissionMap, trade.portfolio_id)
        const netProfit = (trade.profit || 0) - ((trade.lot_size || 0) * commission)
        return { ...trade, profit: netProfit }
    })

    const monthlyTrades = allTrades.filter((trade) => getTradingDayStr(trade.created_at).startsWith(currentMonthPrefix))
    const yearlyTrades = allTrades.filter((trade) => getTradingDayStr(trade.created_at).startsWith(currentYearPrefix))

    return NextResponse.json({
        monthlyData: calculateAnalytics(monthlyTrades),
        yearlyData: calculateAnalytics(yearlyTrades),
    })
}

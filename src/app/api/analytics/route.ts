import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getTradingDayStr, getTradingDay } from '@/utils/date-helpers'

function calculateAnalytics(trades: any[]) {
    let netProfit = 0, grossWin = 0, grossLoss = 0, winCount = 0, lossCount = 0, maxDrawdown = 0, peakEquity = 0
    const assetMap = new Map<string, { profit: number, count: number, wins: number }>()

    // Session/Strategy/DayOfWeek maps
    const sessionMap = new Map<string, { profit: number, count: number, wins: number }>()
    const strategyMap = new Map<string, { profit: number, count: number, wins: number }>()
    const dayMap = new Map<number, { profit: number, count: number, wins: number, dayName: string }>()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Streak tracking
    let currentStreak = 0, maxWinStreak = 0, maxLossStreak = 0, streakType: 'win' | 'loss' | null = null

    const equityCurve = trades.map(trade => {
        const profit = Number(trade.profit) || 0
        netProfit += profit
        if (profit > 0) { grossWin += profit; winCount++; }
        else { grossLoss += Math.abs(profit); if (profit < 0) lossCount++; }

        const asset = assetMap.get(trade.symbol) || { profit: 0, count: 0, wins: 0 }
        asset.profit += profit; asset.count++; if (profit > 0) asset.wins++
        assetMap.set(trade.symbol, asset)

        if (netProfit > peakEquity) peakEquity = netProfit
        const currentDrawdown = peakEquity - netProfit
        if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown

        // Session analysis (UTC hour based)
        const tradeDate = new Date(trade.created_at)
        const utcHour = tradeDate.getUTCHours()
        let session = 'Off-hours'
        if (utcHour >= 0 && utcHour < 8) session = 'Asian'
        else if (utcHour >= 7 && utcHour < 16) session = 'London'
        else if (utcHour >= 13 && utcHour < 22) session = 'New York'

        const sess = sessionMap.get(session) || { profit: 0, count: 0, wins: 0 }
        sess.profit += profit; sess.count++; if (profit > 0) sess.wins++
        sessionMap.set(session, sess)

        // Strategy analysis
        if (trade.strategy) {
            const strat = strategyMap.get(trade.strategy) || { profit: 0, count: 0, wins: 0 }
            strat.profit += profit; strat.count++; if (profit > 0) strat.wins++
            strategyMap.set(trade.strategy, strat)
        }

        // Day-of-week analysis
        const tradingDay = getTradingDay(trade.created_at)
        const dow = tradingDay.getDay()
        const day = dayMap.get(dow) || { profit: 0, count: 0, wins: 0, dayName: dayNames[dow] }
        day.profit += profit; day.count++; if (profit > 0) day.wins++
        dayMap.set(dow, day)

        // Streak tracking
        if (profit > 0) {
            if (streakType === 'win') { currentStreak++ }
            else { currentStreak = 1; streakType = 'win' }
            if (currentStreak > maxWinStreak) maxWinStreak = currentStreak
        } else if (profit < 0) {
            if (streakType === 'loss') { currentStreak++ }
            else { currentStreak = 1; streakType = 'loss' }
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

    const assetPerformance = Array.from(assetMap.entries()).map(([symbol, data]) => ({
        symbol, profit: data.profit, count: data.count, winRate: (data.wins / data.count) * 100
    })).sort((a, b) => b.profit - a.profit)

    const winRateDistribution = [
        { name: 'Win', value: winCount, color: '#ccf381' },
        { name: 'Loss', value: lossCount, color: '#ef4444' },
        { name: 'Breakeven', value: totalTrades - winCount - lossCount, color: '#9ca3af' }
    ].filter(d => d.value > 0)

    // Build new analysis arrays
    const sessionPerformance = Array.from(sessionMap.entries()).map(([session, data]) => ({
        session, profit: Math.round(data.profit * 100) / 100, count: data.count, winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0
    })).sort((a, b) => b.profit - a.profit)

    const strategyPerformance = Array.from(strategyMap.entries()).map(([strategy, data]) => ({
        strategy, profit: Math.round(data.profit * 100) / 100, count: data.count, winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0
    })).sort((a, b) => b.profit - a.profit)

    const dayOfWeekPerformance = [1, 2, 3, 4, 5].map(dow => {
        const data = dayMap.get(dow) || { profit: 0, count: 0, wins: 0, dayName: dayNames[dow] }
        return { day: data.dayName, profit: Math.round(data.profit * 100) / 100, count: data.count, winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0 }
    })

    return {
        stats: { netProfit, winRate, profitFactor, maxDrawdown, totalTrades, avgWin, avgLoss, expectancy },
        equityCurve, assetPerformance, winRateDistribution,
        sessionPerformance, strategyPerformance, dayOfWeekPerformance,
        streaks: { maxWinStreak, maxLossStreak }
    }
}

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Filter trades using robust UTC-safe THAI strings (YYYY-MM and YYYY)
    const todayStr = getTradingDayStr(new Date()) 
    const currentMonthPrefix = todayStr.substring(0, 7) // "YYYY-MM"
    const currentYearPrefix = todayStr.substring(0, 4) // "YYYY"

    // Fetch all trades once
    const { data: allTrades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (error || !allTrades) {
        const emptyData = { stats: { netProfit: 0, winRate: 0, profitFactor: 0, maxDrawdown: 0, totalTrades: 0, avgWin: 0, avgLoss: 0, expectancy: 0 }, equityCurve: [], assetPerformance: [], winRateDistribution: [] }
        return NextResponse.json({ monthlyData: emptyData, yearlyData: emptyData })
    }

    const monthlyTrades = allTrades.filter(t => getTradingDayStr(t.created_at).startsWith(currentMonthPrefix))
    const yearlyTrades = allTrades.filter(t => getTradingDayStr(t.created_at).startsWith(currentYearPrefix))

    return NextResponse.json({
        monthlyData: calculateAnalytics(monthlyTrades),
        yearlyData: calculateAnalytics(yearlyTrades),
    })
}

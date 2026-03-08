import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import { getTradingDay } from '@/utils/date-helpers'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paramMonth = searchParams.get('month')
    const paramYear = searchParams.get('year')

    let targetDate = new Date()
    if (paramMonth && paramYear) {
        const parsedMonth = parseInt(paramMonth, 10) - 1
        const parsedYear = parseInt(paramYear, 10)
        if (!isNaN(parsedMonth) && !isNaN(parsedYear)) {
            targetDate = new Date(parsedYear, parsedMonth, 1)
        }
    }

    const monthStart = startOfMonth(targetDate).toISOString()
    const monthEnd = endOfMonth(targetDate).toISOString()

    // Fetch trades for current month
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(100)

    // Fetch ALL trades for calendar
    const { data: allTrades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(500)

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, port_size, profit_goal_percent, is_portfolio_quest_active')
        .eq('id', user.id)
        .single()

    const username = (user.user_metadata?.full_name as string)
        || (user.user_metadata?.name as string)
        || profile?.username
        || user.email?.split('@')[0]
        || 'Trader'

    // Calculate stats from trades
    const tradeList = trades || []
    const totalTrades = tradeList.length
    const winTrades = tradeList.filter((t: any) => (t.profit || 0) > 0).length
    const totalProfit = tradeList.reduce((sum: number, t: any) => sum + (t.profit || 0), 0)
    const grossProfit = tradeList.filter((t: any) => (t.profit || 0) > 0).reduce((sum: number, t: any) => sum + (t.profit || 0), 0)
    const grossLoss = Math.abs(tradeList.filter((t: any) => (t.profit || 0) < 0).reduce((sum: number, t: any) => sum + (t.profit || 0), 0))
    const lossTrades = tradeList.filter((t: any) => (t.profit || 0) < 0).length

    const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(1) : '0.0'
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0.00')
    const averageWin = winTrades > 0 ? (grossProfit / winTrades).toFixed(2) : '0.00'
    const averageLoss = lossTrades > 0 ? (grossLoss / lossTrades).toFixed(2) : '0.00'
    const totalLots = tradeList.reduce((sum: number, t: any) => sum + (t.lot_size || 0), 0).toFixed(2)

    // Long vs Short
    const longTrades = tradeList.filter((t: any) => t.type === 'BUY')
    const shortTrades = tradeList.filter((t: any) => t.type === 'SELL')
    const longWinRate = longTrades.length > 0 ? ((longTrades.filter((t: any) => (t.profit || 0) > 0).length / longTrades.length) * 100).toFixed(1) : '0.0'
    const shortWinRate = shortTrades.length > 0 ? ((shortTrades.filter((t: any) => (t.profit || 0) > 0).length / shortTrades.length) * 100).toFixed(1) : '0.0'

    const stats = {
        totalTrades,
        winRate,
        netProfit: totalProfit.toFixed(2),
        profitFactor,
        averageWin,
        averageLoss,
        totalLots,
        longStats: { count: longTrades.length, winRate: longWinRate, profit: longTrades.reduce((s: number, t: any) => s + (t.profit || 0), 0).toFixed(2) },
        shortStats: { count: shortTrades.length, winRate: shortWinRate, profit: shortTrades.reduce((s: number, t: any) => s + (t.profit || 0), 0).toFixed(2) }
    }

    // Points
    const portSize = profile?.port_size || 1000
    const goalPercent = profile?.profit_goal_percent || 10
    const isQuestActive = profile?.is_portfolio_quest_active || false
    const today = getTradingDay(new Date())
    const isCurrentMonth = isSameMonth(targetDate, today)

    let monthlyPoints = 0, weeklyPoints = 0, dailyPoints = 0, dailyProfit = 0
    tradeList.forEach((trade: any) => {
        const lot = trade.lot_size || 0.01
        const profit = trade.profit || 0
        const points = lot !== 0 ? Math.round(profit / lot) : 0
        const tradeDay = getTradingDay(trade.created_at)
        monthlyPoints += points
        if (isCurrentMonth) {
            if (isSameWeek(tradeDay, today, { weekStartsOn: 1 })) weeklyPoints += points
            if (isSameDay(tradeDay, today)) { dailyPoints += points; dailyProfit += profit }
        }
    })

    const TRADING_DAYS_PER_MONTH = 20
    const monthlyGoalAmount = portSize * (goalPercent / 100)
    const dailyTargetAmount = monthlyGoalAmount / TRADING_DAYS_PER_MONTH

    return NextResponse.json({
        trades: tradeList,
        allTrades: allTrades || [],
        stats,
        goals: { port_size: portSize, profit_goal_percent: goalPercent, is_portfolio_quest_active: isQuestActive },
        username,
        points: { monthlyPoints, weeklyPoints, dailyPoints, dailyProfit },
        dailyTargetAmount,
        isQuestActive,
        portSize,
        goalPercent,
    })
}

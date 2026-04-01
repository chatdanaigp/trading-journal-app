import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, isSameWeek } from 'date-fns'
import { getTradingDayStr, getTradingDay } from '@/utils/date-helpers'

type TradeRow = {
    id: string
    created_at: string
    portfolio_id: string | null
    symbol: string | null
    type: string | null
    profit: number | null
    lot_size: number | null
}

type PortfolioRow = {
    id: string
    name: string | null
    port_size: number | null
    profit_goal_percent: number | null
    commission_per_lot: number | null
    currency: string | null
}

type TradeWithNet = TradeRow & {
    net_profit: number
    commission_applied: number
}

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paramMonth = searchParams.get('month')
    const paramYear = searchParams.get('year')
    const portfolioId = searchParams.get('portfolio_id')

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

    // Base query for trades
    let tradesQuery = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)

    if (portfolioId && portfolioId !== 'null') {
        tradesQuery = tradesQuery.eq('portfolio_id', portfolioId)
    }

    // Fetch trades for current month (All for stats)
    const { data: allMonthlyTrades } = await tradesQuery
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
    
    const trades = allMonthlyTrades || []

    // Base query for ALL trades
    let allTradesQuery = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)

    if (portfolioId && portfolioId !== 'null') {
        allTradesQuery = allTradesQuery.eq('portfolio_id', portfolioId)
    }

    // Fetch ALL trades for calendar
    const { data: allTrades } = await allTradesQuery
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(500)

    // Fetch profile and all portfolios to get commission settings
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, port_size, profit_goal_percent, is_portfolio_quest_active, commission_per_lot, currency')
        .eq('id', user.id)
        .single()

    const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id, name, port_size, profit_goal_percent, commission_per_lot, currency')
        .eq('user_id', user.id)

    // Create a map for quick commission lookup
    const commissionMap = new Map<string | null, number>()
    commissionMap.set(null, profile?.commission_per_lot || 0)
    const typedPortfolios = (portfolios || []) as PortfolioRow[]

    typedPortfolios.forEach((p) => {
        commissionMap.set(p.id, p.commission_per_lot || profile?.commission_per_lot || 0)
    })

    const username = (user.user_metadata?.full_name as string)
        || (user.user_metadata?.name as string)
        || profile?.username
        || user.email?.split('@')[0]
        || 'Trader'

    // Map trades for stats (Net) and display (Gross)
    const tradeList: TradeWithNet[] = (trades as TradeRow[]).map((t) => {
        const commission = commissionMap.get(t.portfolio_id) || commissionMap.get(null) || 0
        const netProfit = (t.profit || 0) - ((t.lot_size || 0) * commission)
        return { ...t, net_profit: netProfit, commission_applied: commission }
    })

    const displayTrades = tradeList.slice(0, 100).map(t => ({
        ...t,
        profit: t.profit // Original gross profit for the list
    }))

    const totalTrades = tradeList.length
    const winTrades = tradeList.filter((t) => (t.net_profit || 0) > 0).length
    const totalNetProfit = tradeList.reduce((sum: number, t) => sum + (t.net_profit || 0), 0)
    const grossProfitNet = tradeList.filter((t) => (t.net_profit || 0) > 0).reduce((sum: number, t) => sum + (t.net_profit || 0), 0)
    const grossLossNet = Math.abs(tradeList.filter((t) => (t.net_profit || 0) < 0).reduce((sum: number, t) => sum + (t.net_profit || 0), 0))
    const lossTrades = tradeList.filter((t) => (t.net_profit || 0) < 0).length

    const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(1) : '0.0'
    const profitFactor = grossLossNet > 0 ? (grossProfitNet / grossLossNet).toFixed(2) : (grossProfitNet > 0 ? '∞' : '0.00')
    const averageWin = winTrades > 0 ? (grossProfitNet / winTrades).toFixed(2) : '0.00'
    const averageLoss = lossTrades > 0 ? (grossLossNet / lossTrades).toFixed(2) : '0.00'
    const totalLots = tradeList.reduce((sum: number, t) => sum + (t.lot_size || 0), 0).toFixed(2)

    // Long vs Short
    const longTrades = tradeList.filter((t) => t.type === 'BUY')
    const shortTrades = tradeList.filter((t) => t.type === 'SELL')
    const longWinRate = longTrades.length > 0 ? ((longTrades.filter((t) => (t.net_profit || 0) > 0).length / longTrades.length) * 100).toFixed(1) : '0.0'
    const shortWinRate = shortTrades.length > 0 ? ((shortTrades.filter((t) => (t.net_profit || 0) > 0).length / shortTrades.length) * 100).toFixed(1) : '0.0'

    const stats = {
        totalTrades,
        winRate,
        netProfit: totalNetProfit.toFixed(2),
        profitFactor,
        averageWin,
        averageLoss,
        totalLots,
        longStats: { count: longTrades.length, winRate: longWinRate, profit: longTrades.reduce((s: number, t) => s + (t.net_profit || 0), 0).toFixed(2) },
        shortStats: { count: shortTrades.length, winRate: shortWinRate, profit: shortTrades.reduce((s: number, t) => s + (t.net_profit || 0), 0).toFixed(2) }
    }

    // Goals: prefer portfolio-specific, fallback to profile
    let portSize = profile?.port_size ?? 1000
    let goalPercent = profile?.profit_goal_percent ?? 10
    const isQuestActive = profile?.is_portfolio_quest_active || false

    // If a specific portfolio is selected, use its settings
    const portfolioGoals = (portfolioId && portfolioId !== 'null') 
        ? typedPortfolios.find((p) => p.id === portfolioId) 
        : null

    if (portfolioId && portfolioId !== 'null') {
        const portfolio = portfolioGoals
        if (portfolio) {
            // Use portfolio settings if they exist, otherwise fallback to profile defaults
            portSize = portfolio.port_size ?? portSize
            goalPercent = portfolio.profit_goal_percent ?? goalPercent
        }
    }
    
    // Evaluate pure localized strings for exact matching to bypass Vercel UTC shifts
    const todayStr = getTradingDayStr(new Date()) 
    const todayMonthStr = todayStr.substring(0, 7) // "YYYY-MM"
    const targetMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`

    // Weekly approximation: since we can't use isSameWeek easily on string, 
    // we fallback to 'is this week' logic using date-fns on the explicit Midnight Thai Date
    const todaySafeDate = getTradingDay(new Date())
    const isCurrentMonth = todayMonthStr === targetMonthStr

    let monthlyPoints = 0, weeklyPoints = 0, dailyPoints = 0, dailyProfit = 0
    tradeList.forEach((trade) => {
        const lot = trade.lot_size || 0.01
        const grossProfit = trade.profit || 0
        const netProfit = trade.net_profit || 0
        const points = lot !== 0 ? Math.round(grossProfit / lot) : 0
        
        const tradeDayStr = getTradingDayStr(trade.created_at) // "YYYY-MM-DD"
        const tradeSafeDate = getTradingDay(trade.created_at) 
        
        monthlyPoints += points
        if (isCurrentMonth) {
            // Check same week
            if (isSameWeek(tradeSafeDate, todaySafeDate, { weekStartsOn: 1 })) {
                weeklyPoints += points
            }
            // Check same exact daily string
            if (tradeDayStr === todayStr) { 
                dailyPoints += points; 
                dailyProfit += netProfit;
            }
        }
    })

    const TRADING_DAYS_PER_MONTH = 20
    const monthlyGoalAmount = portSize * (goalPercent / 100)
    const dailyTargetAmount = monthlyGoalAmount / TRADING_DAYS_PER_MONTH

    const currency = portfolioGoals?.currency || profile?.currency || 'USD'
    
    return NextResponse.json({
        trades: displayTrades,
        allTrades: allTrades || [],
        stats,
        goals: { port_size: portSize, profit_goal_percent: goalPercent, is_portfolio_quest_active: isQuestActive, currency },
        username,
        points: { monthlyPoints, weeklyPoints, dailyPoints, dailyProfit },
        dailyTargetAmount,
        isQuestActive,
        portSize,
        goalPercent,
        commissionPerLot: commissionMap.get(portfolioId) || commissionMap.get(null) || 0
    })
}

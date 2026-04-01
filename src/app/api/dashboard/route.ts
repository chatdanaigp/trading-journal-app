import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, isSameWeek } from 'date-fns'
import { getTradingDayStr, getTradingDay } from '@/utils/date-helpers'
import { buildCommissionMap, enrichTradesWithNet, calculateTradeStats, calculatePoints } from '@/lib/trade-calculations'
import type { TradeInput } from '@/lib/trade-calculations'

type PortfolioRow = {
    id: string
    name: string | null
    port_size: number | null
    profit_goal_percent: number | null
    commission_per_lot: number | null
    currency: string | null
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

    // Build commission map using shared library
    const typedPortfolios = (portfolios || []) as PortfolioRow[]
    const commissionMap = buildCommissionMap(
        profile?.commission_per_lot || 0,
        typedPortfolios.map(p => ({ id: p.id, commission_per_lot: p.commission_per_lot }))
    )

    const username = (user.user_metadata?.full_name as string)
        || (user.user_metadata?.name as string)
        || profile?.username
        || user.email?.split('@')[0]
        || 'Trader'

    // Enrich trades with net profit using shared library
    const tradeInputs: TradeInput[] = (trades as { id: string; created_at: string; portfolio_id: string | null; symbol: string | null; type: string | null; profit: number | null; lot_size: number | null }[]).map(t => ({
        profit: t.profit,
        lot_size: t.lot_size,
        type: t.type,
        portfolio_id: t.portfolio_id,
    }))
    const enriched = enrichTradesWithNet(tradeInputs, commissionMap)

    // Rebuild full objects with net_profit attached
    const tradeList = (trades as { id: string; created_at: string; portfolio_id: string | null; symbol: string | null; type: string | null; profit: number | null; lot_size: number | null }[]).map((t, i) => ({
        ...t,
        net_profit: enriched[i].net_profit,
        commission_applied: enriched[i].commission_applied,
    }))

    const displayTrades = tradeList.slice(0, 100).map(t => ({
        ...t,
        profit: t.profit // Original gross profit for the list
    }))

    // Calculate stats using shared library
    const stats = calculateTradeStats(enriched)

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
        const netProfit = enriched[tradeList.indexOf(trade)]?.net_profit || 0
        const points = calculatePoints(grossProfit, lot)
        
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

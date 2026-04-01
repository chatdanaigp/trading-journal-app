import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getTradingDay } from '@/utils/date-helpers'
import { isSameDay } from 'date-fns'
import type { ChallengeApiResponse, TradeRecord } from '@/types/models'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Profile + goals
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, port_size, profit_goal_percent, is_portfolio_quest_active')
        .eq('id', user.id)
        .single()

    // All trades for quest progress
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500)

    const tradeList = (trades || []) as TradeRecord[]
    const portSize = profile?.port_size || 1000
    const goalPercent = profile?.profit_goal_percent || 10
    const isQuestActive = profile?.is_portfolio_quest_active || false

    // Calculate daily profit
    const today = getTradingDay(new Date())
    let dailyProfit = 0
    tradeList.forEach((trade) => {
        const tradeDay = getTradingDay(trade.created_at)
        if (isSameDay(tradeDay, today)) dailyProfit += (trade.profit || 0)
    })

    // Quest completion checks
    const quests = [
        { completed: tradeList.some((trade) => (trade.profit || 0) > 0) },
        { completed: false },
        { completed: false },
    ]

    return NextResponse.json<ChallengeApiResponse>({
        goals: { port_size: portSize, profit_goal_percent: goalPercent, is_portfolio_quest_active: isQuestActive },
        trades: tradeList,
        quests,
        dailyProfit,
        portSize,
        goalPercent,
        isQuestActive,
    })
}

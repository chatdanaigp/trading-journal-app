import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { HistoryApiResponse, HistoryTradeRecord } from '@/types/models'
import { buildCommissionMap, getCommission } from '@/lib/trade-calculations'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paramMonth = searchParams.get('month')
    const paramYear = searchParams.get('year')

    const now = new Date()
    let targetYear = paramYear ? parseInt(paramYear, 10) : now.getFullYear()
    let targetMonth = paramMonth ? parseInt(paramMonth, 10) - 1 : now.getMonth()

    if (isNaN(targetYear)) targetYear = now.getFullYear()
    if (isNaN(targetMonth)) targetMonth = now.getMonth()

    const start = new Date(targetYear, targetMonth, 1).toISOString()
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999).toISOString()

    // Fetch up to 1000 trades for the history view, filtered by month
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1000)

    // Fetch profile and all portfolios to get commission settings
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, commission_per_lot')
        .eq('id', user.id)
        .single()

    const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id, commission_per_lot')
        .eq('user_id', user.id)

    // Build commission map using shared library
    const commissionMap = buildCommissionMap(
        (profile as { commission_per_lot: number | null } | null)?.commission_per_lot || 0,
        ((portfolios || []) as { id: string; commission_per_lot: number | null }[]).map(p => ({ id: p.id, commission_per_lot: p.commission_per_lot }))
    )

    const username = (user.user_metadata?.full_name as string)
        || (user.user_metadata?.name as string)
        || profile?.username
        || user.email?.split('@')[0]
        || 'Trader'

    // Calculate dynamic net profit
    const tradeList = ((trades || []) as HistoryTradeRecord[]).map((trade) => {
        const commission = getCommission(commissionMap, trade.portfolio_id)
        const netProfit = (trade.profit || 0) - ((trade.lot_size || 0) * commission)
        // Keep profit as Gross for display, store net_profit separately if needed or just return gross in 'profit'
        return { ...trade, profit: trade.profit, net_profit: netProfit, commission_applied: commission }
    })

    return NextResponse.json<HistoryApiResponse>({
        trades: tradeList,
        username,
    })
}

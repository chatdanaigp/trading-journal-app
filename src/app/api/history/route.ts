import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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

    // Create a map for quick commission lookup
    const commissionMap = new Map<string | null, number>()
    commissionMap.set(null, (profile as any)?.commission_per_lot || 0)
    portfolios?.forEach(p => {
        commissionMap.set(p.id, p.commission_per_lot || (profile as any)?.commission_per_lot || 0)
    })

    const username = (user.user_metadata?.full_name as string)
        || (user.user_metadata?.name as string)
        || profile?.username
        || user.email?.split('@')[0]
        || 'Trader'

    // Calculate dynamic net profit
    const tradeList = (trades || []).map((t: any) => {
        const commission = commissionMap.get(t.portfolio_id) || commissionMap.get(null) || 0
        const netProfit = (t.profit || 0) - ((t.lot_size || 0) * commission)
        // Keep profit as Gross for display, store net_profit separately if needed or just return gross in 'profit'
        return { ...t, profit: t.profit, net_profit: netProfit, commission_applied: commission }
    })

    return NextResponse.json({
        trades: tradeList,
        username,
    })
}

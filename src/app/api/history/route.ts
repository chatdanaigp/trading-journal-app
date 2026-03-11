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

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

    const username = (user.user_metadata?.full_name as string)
        || (user.user_metadata?.name as string)
        || profile?.username
        || user.email?.split('@')[0]
        || 'Trader'

    return NextResponse.json({
        trades: trades || [],
        username,
    })
}

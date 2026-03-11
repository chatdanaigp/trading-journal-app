import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch up to 1000 trades for the history view
    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
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

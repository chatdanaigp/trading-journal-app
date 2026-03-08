import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const now = new Date()
    const monthStart = startOfMonth(now).toISOString()
    const monthEnd = endOfMonth(now).toISOString()

    // Try monthly RPC first, fall back to all-time
    let { data: leaderboard, error } = await supabase.rpc('get_leaderboard', {
        start_date: monthStart,
        end_date: monthEnd
    })

    if (error && error.message?.includes('does not exist')) {
        const fallback = await supabase.rpc('get_leaderboard')
        leaderboard = fallback.data
        error = fallback.error
    }

    if (error) console.error('Error fetching leaderboard:', error)

    return NextResponse.json({
        leaderboard: leaderboard || [],
        currentUserId: user.id
    })
}

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth } from 'date-fns'
import type { LeaderboardApiResponse, LeaderboardEntry } from '@/types/models'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const now = new Date()
    const monthStart = startOfMonth(now).toISOString()
    const monthEnd = endOfMonth(now).toISOString()

    // Try monthly RPC first, fall back to all-time
    const { data: monthlyLeaderboard, error } = await supabase.rpc('get_leaderboard', {
        start_date: monthStart,
        end_date: monthEnd
    })
    let leaderboard = monthlyLeaderboard

    if (error) {
        console.log('[Leaderboard API] Monthly RPC failed:', error.message, '...falling back to all-time RPC')
        const fallback = await supabase.rpc('get_leaderboard')
        leaderboard = fallback.data
        if (fallback.error) {
            console.error('[Leaderboard API] Fallback RPC also failed:', fallback.error.message)
        }
    }

    return NextResponse.json<LeaderboardApiResponse>({
        leaderboard: (leaderboard || []) as LeaderboardEntry[],
        currentUserId: user.id
    })
}

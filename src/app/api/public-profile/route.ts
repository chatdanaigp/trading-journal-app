import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getTradingDayStr, getTradingDay } from '@/utils/date-helpers'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 })

    const supabase = await createClient()

    // Get profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, is_public')
        .eq('username', username)
        .single()

    if (profileError || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!profile.is_public) return NextResponse.json({ error: 'Profile is private' }, { status: 403 })

    // Get user id
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

    if (!userProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get trades (public stats only — no dollar amounts)
    const { data: trades } = await supabase
        .from('trades')
        .select('profit, type, symbol, strategy, created_at')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: true })

    const allTrades = trades || []
    const totalTrades = allTrades.length
    const winCount = allTrades.filter(t => Number(t.profit) > 0).length
    const lossCount = allTrades.filter(t => Number(t.profit) < 0).length
    const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0

    const grossWin = allTrades.filter(t => Number(t.profit) > 0).reduce((s, t) => s + Number(t.profit), 0)
    const grossLoss = Math.abs(allTrades.filter(t => Number(t.profit) < 0).reduce((s, t) => s + Number(t.profit), 0))
    const profitFactor = grossLoss > 0 ? Math.round((grossWin / grossLoss) * 100) / 100 : (grossWin > 0 ? 999 : 0)

    // Streak
    let maxWinStreak = 0, maxLossStreak = 0, currentStreak = 0, streakType: string | null = null
    allTrades.forEach(t => {
        const p = Number(t.profit)
        if (p > 0) {
            if (streakType === 'win') currentStreak++; else { currentStreak = 1; streakType = 'win' }
            if (currentStreak > maxWinStreak) maxWinStreak = currentStreak
        } else if (p < 0) {
            if (streakType === 'loss') currentStreak++; else { currentStreak = 1; streakType = 'loss' }
            if (currentStreak > maxLossStreak) maxLossStreak = currentStreak
        }
    })

    // Equity curve as % change (hide dollar amounts)
    let cumulative = 0
    const equityCurve = allTrades.map(t => {
        cumulative += Number(t.profit) || 0
        return { date: getTradingDayStr(t.created_at), value: cumulative }
    })

    // Normalize to % from first trade
    const initialValue = 1000 // Normalize to hypothetical 1000
    const equityCurvePercent = equityCurve.map(p => ({
        date: p.date,
        percent: Math.round((p.value / initialValue) * 100 * 100) / 100
    }))

    // Strategy breakdown
    const strategyMap = new Map<string, { count: number, wins: number }>()
    allTrades.forEach(t => {
        if (t.strategy) {
            const s = strategyMap.get(t.strategy) || { count: 0, wins: 0 }
            s.count++; if (Number(t.profit) > 0) s.wins++
            strategyMap.set(t.strategy, s)
        }
    })
    const strategies = Array.from(strategyMap.entries()).map(([name, d]) => ({
        name, count: d.count, winRate: Math.round((d.wins / d.count) * 100)
    })).sort((a, b) => b.count - a.count)

    return NextResponse.json({
        profile: { username: profile.username, avatar_url: profile.avatar_url, bio: profile.bio },
        stats: { totalTrades, winRate, profitFactor, maxWinStreak, maxLossStreak, winCount, lossCount },
        equityCurve: equityCurvePercent,
        strategies
    })
}

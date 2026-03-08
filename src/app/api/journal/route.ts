import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Fetch entries
    const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('trading_day', { ascending: false })
        .order('id', { ascending: false })

    // Fetch stats data
    const { data: statsData, error: statsError } = await supabase
        .from('journal_entries')
        .select('trading_day, followed_plan')
        .eq('user_id', user.id)
        .order('trading_day', { ascending: false })

    const entryList = entries || []
    const statsList = statsData || []

    const totalEntries = statsList.length
    const followedCount = statsList.filter((e: any) => e.followed_plan).length
    const followedPlanRate = totalEntries > 0 ? (followedCount / totalEntries) * 100 : 0

    // Calculate streak
    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < statsList.length; i++) {
        const entryDate = new Date(statsList[i].trading_day)
        entryDate.setHours(0, 0, 0, 0)
        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)
        if (entryDate.getTime() === expectedDate.getTime()) streakDays++
        else break
    }

    return NextResponse.json({
        entries: entryList,
        stats: { totalEntries, followedPlanRate, streakDays }
    })
}

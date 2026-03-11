import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getTradingDay } from '@/utils/date-helpers'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Get last month's trades
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', lastMonth.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())
        .order('created_at', { ascending: true })

    if (!trades || trades.length === 0) {
        return NextResponse.json({ hasData: false, month: lastMonth.toLocaleString('default', { month: 'long' }) })
    }

    // Analyze
    const totalTrades = trades.length
    const wins = trades.filter(t => Number(t.profit) > 0)
    const losses = trades.filter(t => Number(t.profit) < 0)
    const winRate = Math.round((wins.length / totalTrades) * 100)
    const netProfit = trades.reduce((s, t) => s + (Number(t.profit) || 0), 0)

    // Best/Worst day
    const dayMap = new Map<string, number>()
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    trades.forEach(t => {
        const day = dayNames[getTradingDay(t.created_at).getDay()]
        dayMap.set(day, (dayMap.get(day) || 0) + (Number(t.profit) || 0))
    })
    const bestDay = [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0]
    const worstDay = [...dayMap.entries()].sort((a, b) => a[1] - b[1])[0]

    // Session analysis
    const sessionMap = new Map<string, { profit: number, count: number }>()
    trades.forEach(t => {
        const hour = new Date(t.created_at).getUTCHours()
        let session = 'Off-hours'
        if (hour >= 0 && hour < 8) session = 'Asian'
        else if (hour >= 7 && hour < 16) session = 'London'
        else if (hour >= 13 && hour < 22) session = 'New York'
        const s = sessionMap.get(session) || { profit: 0, count: 0 }
        s.profit += Number(t.profit) || 0; s.count++
        sessionMap.set(session, s)
    })
    const bestSession = [...sessionMap.entries()].sort((a, b) => b[1].profit - a[1].profit)[0]

    // Strategy analysis
    const stratMap = new Map<string, { profit: number, count: number }>()
    trades.forEach(t => {
        if (t.strategy) {
            const s = stratMap.get(t.strategy) || { profit: 0, count: 0 }
            s.profit += Number(t.profit) || 0; s.count++
            stratMap.set(t.strategy, s)
        }
    })
    const bestStrategy = stratMap.size > 0
        ? [...stratMap.entries()].sort((a, b) => b[1].profit - a[1].profit)[0]
        : null

    // Streak
    let maxWinStreak = 0, currentStreak = 0, streakType: string | null = null
    trades.forEach(t => {
        const p = Number(t.profit)
        if (p > 0) {
            if (streakType === 'win') currentStreak++; else { currentStreak = 1; streakType = 'win' }
            if (currentStreak > maxWinStreak) maxWinStreak = currentStreak
        } else if (p < 0) {
            streakType = 'loss'; currentStreak = 1
        }
    })

    // Generate insights
    const insights: string[] = []

    if (winRate > 55) {
        insights.push(`🎯 Win Rate ${winRate}% สูงกว่าค่าเฉลี่ย ดีมาก! รักษาฟอร์มนี้ไว้ครับ`)
    } else if (winRate < 40) {
        insights.push(`⚠️ Win Rate ${winRate}% ต่ำกว่าที่ควร ลองทบทวนจุดเข้าสวยๆ อีกทีนะครับ`)
    } else {
        insights.push(`📊 Win Rate ${winRate}% อยู่ในระดับปกติ ยังมีโอกาสพัฒนาได้อีกครับ`)
    }

    if (bestDay) {
        insights.push(`📅 วัน **${bestDay[0]}** ทำกำไรดีที่สุด $${bestDay[1].toFixed(0)} ${worstDay ? `| วัน **${worstDay[0]}** เสียเยอะสุด $${worstDay[1].toFixed(0)}` : ''}`)
    }

    if (bestSession) {
        insights.push(`🕐 Session **${bestSession[0]}** ให้ผลตอบแทนดีที่สุด ($${bestSession[1].profit.toFixed(0)} จาก ${bestSession[1].count} ออเดอร์)`)
    }

    if (bestStrategy) {
        insights.push(`🏷️ กลยุทธ์ **#${bestStrategy[0]}** ทำกำไรสูงสุด $${bestStrategy[1].profit.toFixed(0)} (${bestStrategy[1].count} ออเดอร์)`)
    }

    if (maxWinStreak >= 3) {
        insights.push(`🔥 ชนะติดต่อกันสูงสุด ${maxWinStreak} ออเดอร์ — เทรดดีมาก! อย่าเทรด Overconfident นะครับ`)
    }

    if (netProfit > 0) {
        insights.push(`✅ เดือนนี้กำไรสุทธิ +$${netProfit.toFixed(0)} เก่งมาก! เป้าหมายเดือนหน้าลองตั้งสูงขึ้นได้ครับ`)
    } else {
        insights.push(`❌ เดือนนี้ขาดทุนสุทธิ $${netProfit.toFixed(0)} — ไม่เป็นไรครับ ทบทวนแล้วเดินหน้าต่อ!`)
    }

    return NextResponse.json({
        hasData: true,
        month: lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
        summary: { totalTrades, winRate, netProfit: Math.round(netProfit), bestDay: bestDay?.[0] || '-', bestSession: bestSession?.[0] || '-' },
        insights
    })
}

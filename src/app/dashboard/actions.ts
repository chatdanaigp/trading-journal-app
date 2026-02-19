'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTrade(formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const symbol = formData.get('symbol') as string
    const type = formData.get('type') as string
    const lotSize = formData.get('lotSize')
    const entryPrice = formData.get('entryPrice')
    const tradeDate = formData.get('tradeDate') as string

    // Optional fields
    const exitPrice = formData.get('exitPrice')
    const profit = formData.get('profit')
    const notes = formData.get('notes') as string
    const screenshot = formData.get('screenshot') as File

    let screenshotUrl = null

    if (screenshot && screenshot.size > 0) {
        const fileExt = screenshot.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('trade-screenshots')
            .upload(fileName, screenshot)

        if (uploadError) {
            console.error('Error uploading screenshot:', uploadError)
            // Continue creating trade even if upload fails, or return error?
            // Let's log it but continue for now, maybe add a warning
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('trade-screenshots')
                .getPublicUrl(fileName)

            screenshotUrl = publicUrl
        }
    }

    const { error } = await supabase.from('trades').insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        type,
        lot_size: Number(lotSize),
        entry_price: Number(entryPrice),
        exit_price: exitPrice ? Number(exitPrice) : null,
        profit: profit ? Number(profit) : null,
        notes: notes,
        screenshot_url: screenshotUrl,
        created_at: tradeDate ? new Date(tradeDate).toISOString() : new Date().toISOString()
    })

    if (error) {
        console.error('Supabase Error:', error)
        return { error: error.message }
    }

    // Send Discord Notification (Fire and Forget)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (webhookUrl) {
        const embed = {
            title: `New Trade Logged: ${symbol.toUpperCase()}`,
            color: profit ? (Number(profit) >= 0 ? 5763719 : 15548997) : 3447003, // Green, Red, or Blue
            fields: [
                { name: 'Type', value: type, inline: true },
                { name: 'Entry', value: entryPrice, inline: true },
                { name: 'Lot Size', value: lotSize, inline: true },
                { name: 'Profit/Loss', value: profit ? `$${profit}` : 'Open', inline: true },
                { name: 'Trader', value: user.email?.split('@')[0] || 'Unknown', inline: true }
            ],
            timestamp: new Date().toISOString(),
            ...(screenshotUrl && { image: { url: screenshotUrl } })
        }

        /* 
           Using fetch to send POST request to Discord Webhook.
           We don't await this because we don't want to slow down the UI response.
        */
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] }),
        }).catch(err => console.error('Discord Webhook Error:', err))
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateTrade(formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const tradeId = formData.get('tradeId') as string
    const symbol = formData.get('symbol') as string
    const type = formData.get('type') as string
    const lotSize = formData.get('lotSize')
    const entryPrice = formData.get('entryPrice')
    const tradeDate = formData.get('tradeDate') as string

    // Optional fields
    const exitPrice = formData.get('exitPrice')
    const profit = formData.get('profit')
    const notes = formData.get('notes') as string

    // We are not handling screenshot updates in this version for simplicity, 
    // but we could add it later.

    const { error } = await supabase
        .from('trades')
        .update({
            symbol: symbol.toUpperCase(),
            type,
            lot_size: Number(lotSize),
            entry_price: Number(entryPrice),
            exit_price: exitPrice ? Number(exitPrice) : null,
            profit: profit ? Number(profit) : null,
            notes: notes,
            created_at: tradeDate ? new Date(tradeDate).toISOString() : undefined
        })
        .eq('id', tradeId)
        .eq('user_id', user.id) // Ensure user owns the trade

    if (error) {
        console.error('Supabase Error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getTrades() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50) // Limit to last 50 trades for now

    if (error) {
        console.error('Error fetching trades:', error)
        return []
    }

    return data
}

export async function getTradeStats() {
    const trades = await getTrades()

    if (!trades.length) return { totalTrades: 0, winRate: '0.0', netProfit: '0.00' }

    const totalTrades = trades.length
    const winTrades = trades.filter(t => (t.profit || 0) > 0).length
    const lossTrades = totalTrades - winTrades
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0)

    const grossProfit = trades.filter(t => (t.profit || 0) > 0).reduce((sum, t) => sum + (t.profit || 0), 0)
    const grossLoss = Math.abs(trades.filter(t => (t.profit || 0) < 0).reduce((sum, t) => sum + (t.profit || 0), 0))

    const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(1) : '0.0'
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0.00')

    const averageWin = winTrades > 0 ? (grossProfit / winTrades).toFixed(2) : '0.00'
    const averageLoss = lossTrades > 0 ? (grossLoss / lossTrades).toFixed(2) : '0.00'

    const totalLots = trades.reduce((sum, t) => sum + (t.lot_size || 0), 0).toFixed(2)

    // Long vs Short Stats
    const longTrades = trades.filter(t => t.type === 'BUY')
    const shortTrades = trades.filter(t => t.type === 'SELL')

    const longWinRate = longTrades.length > 0
        ? ((longTrades.filter(t => (t.profit || 0) > 0).length / longTrades.length) * 100).toFixed(1)
        : '0.0'
    const shortWinRate = shortTrades.length > 0
        ? ((shortTrades.filter(t => (t.profit || 0) > 0).length / shortTrades.length) * 100).toFixed(1)
        : '0.0'

    const longProfit = longTrades.reduce((sum, t) => sum + (t.profit || 0), 0).toFixed(2)
    const shortProfit = shortTrades.reduce((sum, t) => sum + (t.profit || 0), 0).toFixed(2)

    return {
        totalTrades,
        winRate,
        netProfit: totalProfit.toFixed(2),
        profitFactor,
        averageWin,
        averageLoss,
        totalLots,
        longStats: {
            count: longTrades.length,
            winRate: longWinRate,
            profit: longProfit
        },
        shortStats: {
            count: shortTrades.length,
            winRate: shortWinRate,
            profit: shortProfit
        }
    }
}

export async function analyzeTrade(tradeId: string) {
    const supabase = await createClient()

    // 1. Fetch the trade
    const { data: trade, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single()

    if (fetchError || !trade) return { error: 'Trade not found' }

    // 2. "AI" Analysis Logic (Rule-based Mock)
    let analysis = ""
    const profit = Number(trade.profit)
    const type = trade.type
    const symbol = trade.symbol

    const positivePhrases = [
        "เข้าออเดอร์ได้สวยมาก! ตามเทรนด์เป๊ะๆ ครับ",
        "บริหารความเสี่ยงได้ยอดเยี่ยมครับไม้นี้",
        "เฉียบคมมาก! จุดเข้าสวยและทำตามแผนได้ดี",
        "เทรดแบบนี้แหละครับ พอร์ตโตแน่นอน รักษาฟอร์มไว้นะ!"
    ]
    const negativePhrases = [
        "ระวังเรื่อง Stop Loss ด้วยนะครับ ไม้นี้เจ็บหนักไปหน่อย",
        "ใจเย็นๆ นะครับ อย่าเพิ่งไล่ราคา (Chase) รอจังหวะเข้าสวยๆ ดีกว่า",
        "ลองทบทวนแผนดูอีกทีนะครับ ไม้นี้เข้าตามระบบหรือเปล่า?",
        "อย่าเทรดแก้แค้น (Revenge Trade) นะครับ พักดื่มน้ำแล้วค่อยลุยใหม่"
    ]

    if (profit > 0) {
        analysis = `✅ **AI Coach:** ${positivePhrases[Math.floor(Math.random() * positivePhrases.length)]} (กำไร: +$${profit})`
    } else if (profit < 0) {
        analysis = `⚠️ **AI Coach:** ${negativePhrases[Math.floor(Math.random() * negativePhrases.length)]} (ขาดทุน: $${profit})`
    } else {
        analysis = "ℹ️ **AI Coach:** เสมอตัวครับ (Breakeven) ดีแล้วที่รักษาเงินต้นไว้ได้ รอจังหวะหน้าเอาใหม่ครับ"
    }

    // 3. Save Analysis
    const { error: updateError } = await supabase
        .from('trades')
        .update({ ai_analysis: analysis })
        .eq('id', tradeId)

    if (updateError) return { error: updateError.message }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getProfileGoals() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('port_size, profit_goal_percent')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile goals:', error)
        return { port_size: 1000, profit_goal_percent: 10 } // Default fallback
    }

    return data
}

export async function updateProfileGoals(portSize: number, profitGoalPercent: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({
            port_size: portSize,
            profit_goal_percent: profitGoalPercent
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

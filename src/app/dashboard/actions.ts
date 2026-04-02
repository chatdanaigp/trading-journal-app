'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { enrichTradesWithNet, calculateTradeStats } from '@/lib/trade-calculations'


type ProfileGoalUpdate = {
    port_size: number
    profit_goal_percent: number
    commission_per_lot: number
    currency: string
    is_portfolio_quest_active?: boolean
}

function getErrorMessage(error: unknown, fallback = 'Unknown error') {
    if (error instanceof Error) {
        return error.message
    }

    return fallback
}

async function getAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

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
    const stopLoss = formData.get('stopLoss')
    const takeProfit = formData.get('takeProfit')
    const strategy = formData.get('strategy') as string
    let screenshotUrl = null

    try {
        if (screenshot && screenshot instanceof File && screenshot.size > 0 && screenshot.name !== 'undefined') {
            const adminSupabase = await getAdminClient()
            const fileExt = screenshot.name.split('.').pop() || 'png'
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await adminSupabase.storage
                .from('trade-screenshots')
                .upload(fileName, screenshot)

            if (!uploadError) {
                const { data: { publicUrl } } = adminSupabase.storage
                    .from('trade-screenshots')
                    .getPublicUrl(fileName)
                screenshotUrl = publicUrl
            } else {
                console.error('Supabase Storage upload failed:', uploadError)
                return { error: `Upload failed: ${uploadError.message}` }
            }
        }
    } catch (uploadErr: unknown) {
        console.error('Catastrophic upload error during create:', uploadErr)
        return { error: `Upload error: ${getErrorMessage(uploadErr)}` }
    }

    const exactCreatedAt = formData.get('exactCreatedAt') as string

    let createdAt = new Date().toISOString()
    if (exactCreatedAt) {
        createdAt = exactCreatedAt
    } else if (tradeDate) {
        if (tradeDate.length === 10) {
            // Fallback for old forms
            createdAt = new Date(`${tradeDate}T12:00:00Z`).toISOString()
        } else {
            createdAt = new Date(tradeDate).toISOString()
        }
    }

    const portfolioId = formData.get('portfolioId') as string

    // Auto-assign to first portfolio if none provided (e.g., saving from "All Trades")
    let finalPortfolioId: string | null = portfolioId || null
    if (!finalPortfolioId) {
        const { data: firstPortfolio } = await supabase
            .from('portfolios')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()
        if (firstPortfolio) {
            finalPortfolioId = firstPortfolio.id
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
        created_at: createdAt,
        stop_loss: stopLoss ? Number(stopLoss) : null,
        take_profit: takeProfit ? Number(takeProfit) : null,
        strategy: strategy || null,
        portfolio_id: finalPortfolioId,
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

    revalidatePath('/', 'layout')
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
    const stopLoss = formData.get('stopLoss')
    const takeProfit = formData.get('takeProfit')
    const strategy = formData.get('strategy') as string

    const exactCreatedAt = formData.get('exactCreatedAt') as string

    let createdAt: string | undefined = undefined
    if (exactCreatedAt) {
        createdAt = exactCreatedAt
    } else if (tradeDate) {
        if (tradeDate.length === 10) {
            createdAt = new Date(`${tradeDate}T12:00:00Z`).toISOString()
        } else {
            createdAt = new Date(tradeDate).toISOString()
        }
    }

    // Handle screenshot update
    let screenshotUrl = undefined
    try {
        const screenshot = formData.get('screenshot') as File | null
        if (screenshot && screenshot instanceof File && screenshot.size > 0 && screenshot.name !== 'undefined') {
            console.log('Detected screenshot for update, size:', screenshot.size)
            
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.error('SUPABASE_SERVICE_ROLE_KEY is missing')
                return { error: 'Server configuration error: missing service key' }
            }

            const adminSupabase = await getAdminClient()
            const fileExt = screenshot.name.split('.').pop() || 'png'
            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            
            const { error: uploadError } = await adminSupabase.storage
                .from('trade-screenshots')
                .upload(fileName, screenshot, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (!uploadError) {
                const { data: { publicUrl } } = adminSupabase.storage
                    .from('trade-screenshots')
                    .getPublicUrl(fileName)
                screenshotUrl = publicUrl
                console.log('Update screenshot upload successful:', screenshotUrl)
            } else {
                console.error('Supabase Storage update failed:', uploadError)
                return { error: `Upload failed: ${uploadError.message}` }
            }
        }
    } catch (uploadErr: unknown) {
        console.error('Catastrophic upload error during update:', uploadErr)
        return { error: `Upload error: ${getErrorMessage(uploadErr)}` }
    }

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
            created_at: createdAt,
            stop_loss: stopLoss ? Number(stopLoss) : null,
            take_profit: takeProfit ? Number(takeProfit) : null,
            strategy: strategy || null,
            ...(screenshotUrl !== undefined && { screenshot_url: screenshotUrl }),
        })
        .eq('id', tradeId)
        .eq('user_id', user.id) // Ensure user owns the trade

    if (error) {
        console.error('Supabase Error:', error)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function deleteTrade(tradeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Failed to delete trade:', error)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function getTrades(startDate?: string, endDate?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)

    if (startDate) {
        query = query.gte('created_at', startDate)
    }
    if (endDate) {
        query = query.lte('created_at', endDate)
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(100) // Increased limit to ensure we get a full month's worth of typical trading activity

    if (error) {
        console.error('Error fetching trades:', error)
        return []
    }

    return data
}

export async function getTradeStats(startDate?: string, endDate?: string) {
    const trades = await getTrades(startDate, endDate)

    if (!trades.length) return {
        totalTrades: 0,
        winRate: '0.0',
        netProfit: '0.00',
        profitFactor: '0.00',
        averageWin: '0.00',
        averageLoss: '0.00',
        totalLots: '0.00',
        longStats: { count: 0, winRate: '0.0', profit: '0.00' },
        shortStats: { count: 0, winRate: '0.0', profit: '0.00' }
    }

    // Use shared library with 0 commission (getTradeStats uses gross profit)
    const noCommission = new Map<string | null, number>([[null, 0]])
    const enriched = enrichTradesWithNet(
        trades.map(t => ({ profit: t.profit, lot_size: t.lot_size, type: t.type, portfolio_id: t.portfolio_id })),
        noCommission
    )

    return calculateTradeStats(enriched)
}



export async function getProfileGoals() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('port_size, profit_goal_percent, is_portfolio_quest_active, commission_per_lot, currency')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile goals:', error)
        return { port_size: 1000, profit_goal_percent: 10, is_portfolio_quest_active: false, commission_per_lot: 0 } // Default fallback
    }

    return data
}

export async function updateProfileGoals(portSize: number, profitGoalPercent: number, isQuestActive?: boolean, commissionPerLot?: number, currency?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const updateData: ProfileGoalUpdate = {
        port_size: portSize,
        profit_goal_percent: profitGoalPercent,
        commission_per_lot: commissionPerLot || 0,
        currency: currency || 'USD'
    }

    if (isQuestActive !== undefined) {
        updateData.is_portfolio_quest_active = isQuestActive
    }

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updatePortfolioGoals(portfolioId: string, portSize: number, profitGoalPercent: number, commissionPerLot?: number, currency?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('portfolios')
        .update({
            port_size: portSize,
            profit_goal_percent: profitGoalPercent,
            commission_per_lot: commissionPerLot || 0,
            currency: currency || 'USD',
        })
        .eq('id', portfolioId)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
}

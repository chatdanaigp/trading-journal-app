import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

type NullPortfolioTradeRow = {
    id: string
    user_id: string
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Migration failed'
}

export async function POST() {
    // Only allow if authorized or via local development trigger
    // Using service role for global migration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseServiceKey) {
        return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        // 1. Get all trades with null portfolio_id
        const { data: nullTrades, error: fetchError } = await supabase
            .from('trades')
            .select('id, user_id')
            .is('portfolio_id', null)

        if (fetchError) throw fetchError
        if (!nullTrades || nullTrades.length === 0) {
            return NextResponse.json({ message: 'No trades with null portfolio_id found' })
        }

        console.log(`Found ${nullTrades.length} trades to migrate.`)

        // 2. Group by user_id to avoid redundant portfolio lookups
        const typedNullTrades = (nullTrades ?? []) as NullPortfolioTradeRow[]
        const userIds = Array.from(new Set(typedNullTrades.map((trade) => trade.user_id)))
        const userPortfolios: Record<string, string> = {}

        for (const userId of userIds) {
            // Find first portfolio for user (default)
            const { data: firstPort, error: portError } = await supabase
                .from('portfolios')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(1)
                .single()

            if (portError) {
                console.error(`Error finding portfolio for user ${userId}:`, portError)
                continue
            }

            if (firstPort) {
                userPortfolios[userId] = firstPort.id
            }
        }

        // 3. Batch updates
        let successCount = 0
        for (const trade of typedNullTrades) {
            const portfolioId = userPortfolios[trade.user_id]
            if (portfolioId) {
                const { error: updateError } = await supabase
                    .from('trades')
                    .update({ portfolio_id: portfolioId })
                    .eq('id', trade.id)

                if (updateError) {
                    console.error(`Error updating trade ${trade.id}:`, updateError)
                } else {
                    successCount++
                }
            }
        }

        return NextResponse.json({
            message: 'Migration complete',
            totalFound: typedNullTrades.length,
            successfullyMigrated: successCount
        })

    } catch (error: unknown) {
        console.error('Migration failed:', error)
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
    }
}

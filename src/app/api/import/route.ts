import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const format = formData.get('format') as string || 'generic'

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        const text = await file.text()
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean)

        if (lines.length < 2) return NextResponse.json({ error: 'File is empty or has no data rows' }, { status: 400 })

        let trades: any[] = []

        if (format === 'mt4' || format === 'mt5') {
            trades = parseMT4MT5(lines, user.id)
        } else {
            trades = parseGenericCSV(lines, user.id)
        }

        if (trades.length === 0) {
            return NextResponse.json({ error: 'No valid trades found. Check CSV format.' }, { status: 400 })
        }

        // Batch insert
        const { error } = await supabase.from('trades').insert(trades)

        if (error) {
            console.error('CSV import DB error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, imported: trades.length })
    } catch (err: any) {
        console.error('CSV import error:', err)
        return NextResponse.json({ error: err.message || 'Failed to parse CSV' }, { status: 500 })
    }
}

function parseMT4MT5(lines: string[], userId: string): any[] {
    const trades: any[] = []
    // MT4/MT5 history CSV usually has headers like:
    // Ticket, Open Time, Type, Size, Item, Price, S/L, T/P, Close Time, Close Price, Profit
    // Find header row
    const headerIdx = lines.findIndex(line =>
        line.toLowerCase().includes('ticket') &&
        (line.toLowerCase().includes('profit') || line.toLowerCase().includes('size'))
    )

    if (headerIdx === -1) return trades

    const headers = lines[headerIdx].split(/[,\t;]/).map(h => h.trim().toLowerCase())
    const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)))

    const typeIdx = getIdx(['type'])
    const sizeIdx = getIdx(['size', 'volume', 'lot'])
    const symbolIdx = getIdx(['item', 'symbol'])
    const priceIdx = getIdx(['price', 'open price'])
    const closePriceIdx = getIdx(['close price'])
    const profitIdx = getIdx(['profit'])
    const dateIdx = getIdx(['open time', 'time'])
    const slIdx = getIdx(['s/l', 'sl', 'stop loss'])
    const tpIdx = getIdx(['t/p', 'tp', 'take profit'])

    for (let i = headerIdx + 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,\t;]/).map(c => c.trim())
        if (cols.length < 5) continue

        const typeStr = cols[typeIdx]?.toLowerCase() || ''
        if (!typeStr.includes('buy') && !typeStr.includes('sell')) continue

        const type = typeStr.includes('buy') ? 'BUY' : 'SELL'
        const lotSize = parseFloat(cols[sizeIdx]) || 0.01
        const symbol = (cols[symbolIdx] || 'XAUUSD').toUpperCase()
        const entryPrice = parseFloat(cols[priceIdx]) || 0
        const exitPrice = closePriceIdx >= 0 ? parseFloat(cols[closePriceIdx]) || null : null
        const profit = parseFloat(cols[profitIdx]) || 0
        const dateStr = cols[dateIdx] || ''
        const stopLoss = slIdx >= 0 ? parseFloat(cols[slIdx]) || null : null
        const takeProfit = tpIdx >= 0 ? parseFloat(cols[tpIdx]) || null : null

        let createdAt = new Date().toISOString()
        if (dateStr) {
            const parsed = new Date(dateStr)
            if (!isNaN(parsed.getTime())) createdAt = parsed.toISOString()
        }

        trades.push({
            user_id: userId,
            symbol,
            type,
            lot_size: lotSize,
            entry_price: entryPrice,
            exit_price: exitPrice,
            profit,
            created_at: createdAt,
            stop_loss: stopLoss,
            take_profit: takeProfit,
            notes: 'Imported from MT4/MT5'
        })
    }

    return trades
}

function parseGenericCSV(lines: string[], userId: string): any[] {
    const trades: any[] = []
    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ','

    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase())
    const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)))

    const symbolIdx = getIdx(['symbol', 'pair', 'instrument', 'item', 'asset'])
    const typeIdx = getIdx(['type', 'side', 'direction', 'action'])
    const lotIdx = getIdx(['lot', 'size', 'volume', 'quantity'])
    const entryIdx = getIdx(['entry', 'open', 'price'])
    const exitIdx = getIdx(['exit', 'close price', 'close'])
    const profitIdx = getIdx(['profit', 'pnl', 'p&l', 'result'])
    const dateIdx = getIdx(['date', 'time', 'open time', 'created'])
    const slIdx = getIdx(['sl', 'stop loss', 'stop_loss', 's/l'])
    const tpIdx = getIdx(['tp', 'take profit', 'take_profit', 't/p'])
    const strategyIdx = getIdx(['strategy', 'setup', 'tag'])
    const notesIdx = getIdx(['notes', 'comment', 'note'])

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim())
        if (cols.length < 3) continue

        const symbol = symbolIdx >= 0 ? (cols[symbolIdx] || 'XAUUSD').toUpperCase() : 'XAUUSD'

        let type = 'BUY'
        if (typeIdx >= 0) {
            const t = cols[typeIdx]?.toLowerCase() || ''
            type = t.includes('sell') || t.includes('short') ? 'SELL' : 'BUY'
        }

        const lotSize = lotIdx >= 0 ? parseFloat(cols[lotIdx]) || 0.01 : 0.01
        const entryPrice = entryIdx >= 0 ? parseFloat(cols[entryIdx]) || 0 : 0
        const exitPrice = exitIdx >= 0 ? parseFloat(cols[exitIdx]) || null : null
        const profit = profitIdx >= 0 ? parseFloat(cols[profitIdx]) || 0 : 0
        const stopLoss = slIdx >= 0 ? parseFloat(cols[slIdx]) || null : null
        const takeProfit = tpIdx >= 0 ? parseFloat(cols[tpIdx]) || null : null
        const strategy = strategyIdx >= 0 ? cols[strategyIdx] || null : null
        const notes = notesIdx >= 0 ? cols[notesIdx] || 'Imported from CSV' : 'Imported from CSV'

        let createdAt = new Date().toISOString()
        if (dateIdx >= 0 && cols[dateIdx]) {
            const parsed = new Date(cols[dateIdx])
            if (!isNaN(parsed.getTime())) createdAt = parsed.toISOString()
        }

        if (entryPrice === 0 && profit === 0) continue // Skip empty rows

        trades.push({
            user_id: userId,
            symbol,
            type,
            lot_size: lotSize,
            entry_price: entryPrice,
            exit_price: exitPrice,
            profit,
            created_at: createdAt,
            stop_loss: stopLoss,
            take_profit: takeProfit,
            strategy,
            notes
        })
    }

    return trades
}

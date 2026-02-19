import React from 'react'

interface TradeShareCardProps {
    trade: {
        symbol: string
        type: string
        lot_size: number
        entry_price: number
        exit_price?: number
        profit: number
        created_at: string
    }
    username?: string
    points?: number
}

export function TradeShareCard({ trade, username, points }: TradeShareCardProps) {
    const profit = Number(trade.profit) || 0
    const isProfit = profit >= 0

    // Calculate exit if missing
    const lot = trade.lot_size || 0.01
    let exitPrice = trade.exit_price
    if (!exitPrice && trade.entry_price) {
        const diff = profit / (lot * 100)
        exitPrice = trade.type === 'BUY'
            ? trade.entry_price + diff
            : trade.entry_price - diff
    }

    const dateStr = new Date(trade.created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    })

    const accentColor = isProfit ? '#ccf381' : '#f87171'
    const accentGlow = isProfit ? 'rgba(204,243,129,0.25)' : 'rgba(248,113,113,0.25)'
    const typeColor = trade.type === 'BUY' ? '#4ade80' : '#f87171'
    const typeBg = trade.type === 'BUY' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'

    return (
        <div style={{
            width: '600px',
            height: '360px',
            background: 'linear-gradient(145deg, #111111 0%, #0d0d0d 60%, #0a0f0a 100%)',
            borderRadius: '24px',
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '28px 32px',
            boxSizing: 'border-box',
        }}>
            {/* Glow blob behind P&L */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '340px', height: '220px',
                background: accentGlow,
                borderRadius: '50%',
                filter: 'blur(80px)',
                pointerEvents: 'none',
            }} />

            {/* Corner accent lines */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '24px',
                border: `1px solid ${isProfit ? 'rgba(204,243,129,0.18)' : 'rgba(248,113,113,0.18)'}`,
                pointerEvents: 'none',
            }} />

            {/* TOP: Branding + Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '30px', height: '30px',
                        background: 'linear-gradient(135deg, #ccf381, #a8d44e)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '15px', fontWeight: '900', color: '#000',
                        flexShrink: 0,
                    }}>T</div>
                    <span style={{ color: '#ccf381', fontSize: '14px', fontWeight: '700', letterSpacing: '0.04em' }}>
                        Trading Journal
                    </span>
                </div>
                <span style={{ color: '#444', fontSize: '13px' }}>{dateStr}</span>
            </div>

            {/* MIDDLE: Symbol + P&L */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                {/* Left: Symbol + Type */}
                <div>
                    <div style={{
                        fontSize: '48px', fontWeight: '900', color: '#ffffff',
                        letterSpacing: '-0.03em', lineHeight: 1,
                    }}>
                        {trade.symbol}
                    </div>
                    <div style={{
                        display: 'inline-block', marginTop: '10px',
                        padding: '5px 16px', borderRadius: '100px',
                        background: typeBg,
                        color: typeColor,
                        fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em',
                    }}>
                        {trade.type}
                    </div>
                </div>

                {/* Right: P&L */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '56px', fontWeight: '900',
                        color: accentColor,
                        lineHeight: 1, letterSpacing: '-0.02em',
                        textShadow: `0 0 40px ${accentGlow}`,
                    }}>
                        {isProfit ? '+' : ''}{profit < 0 ? `-$${Math.abs(profit).toLocaleString()}` : `$${profit.toLocaleString()}`}
                    </div>
                    {points !== undefined && points !== 0 && (
                        <div style={{
                            marginTop: '6px', fontSize: '16px', fontWeight: '700',
                            color: isProfit ? 'rgba(204,243,129,0.55)' : 'rgba(248,113,113,0.55)',
                            textAlign: 'right',
                        }}>
                            {points > 0 ? '+' : ''}{points.toLocaleString()} pts
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM: Entry/Exit/Lot + Username */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
                {/* Trade details row */}
                <div style={{ display: 'flex', gap: '24px' }}>
                    {[
                        { label: 'ENTRY', value: trade.entry_price?.toLocaleString() },
                        { label: 'EXIT', value: exitPrice?.toFixed(2) },
                        { label: 'LOT', value: String(trade.lot_size) },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <div style={{ color: '#444', fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', marginBottom: '3px' }}>
                                {label}
                            </div>
                            <div style={{ color: '#999', fontSize: '15px', fontWeight: '600', fontFamily: 'monospace' }}>
                                {value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Username + Watermark */}
                <div style={{ textAlign: 'right' }}>
                    {username && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: `linear-gradient(135deg, ${accentColor}, #6ee7b7)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: '900', color: '#000', flexShrink: 0,
                            }}>
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: '#666', fontSize: '13px', fontWeight: '600' }}>
                                {username}
                            </span>
                        </div>
                    )}
                    <div style={{ color: '#2a2a2a', fontSize: '11px', letterSpacing: '0.04em' }}>
                        trading-journal.app
                    </div>
                </div>
            </div>
        </div>
    )
}

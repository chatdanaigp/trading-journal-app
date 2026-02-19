import React from 'react'

interface TradeShareCardProps {
    trade: {
        symbol: string
        type: string
        lot_size: number
        entry_price: number
        exit_price?: number
        profit: number
        notes?: string
        ai_analysis?: string
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

    // Trim AI analysis to a readable snippet
    const aiRaw = trade.ai_analysis || ''
    // Remove markdown bold markers and emoji for cleaner display
    const aiClean = aiRaw.replace(/\*\*/g, '').replace(/[✅⚠️❌🔴🟡🟢]/g, '').trim()
    const aiSnippet = aiClean.length > 160 ? aiClean.slice(0, 157) + '…' : aiClean

    const dateStr = new Date(trade.created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    })

    return (
        <div
            style={{
                width: '800px',
                height: '420px',
                background: 'linear-gradient(135deg, #0d0d0d 0%, #141414 40%, #0a0a0a 100%)',
                borderRadius: '20px',
                padding: '0',
                fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Decorative glow blobs */}
            <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '240px', height: '240px',
                background: isProfit ? 'rgba(204,243,129,0.12)' : 'rgba(239,68,68,0.12)',
                borderRadius: '50%', filter: 'blur(60px)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-80px', left: '-40px',
                width: '200px', height: '200px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '50%', filter: 'blur(50px)',
                pointerEvents: 'none',
            }} />

            {/* Border */}
            <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '20px',
                border: `1px solid ${isProfit ? 'rgba(204,243,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                pointerEvents: 'none',
            }} />

            {/* Content wrapper */}
            <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

                {/* TOP ROW: Branding + Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Logo mark */}
                        <div style={{
                            width: '32px', height: '32px',
                            background: 'linear-gradient(135deg, #ccf381, #a8d44e)',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', fontWeight: '900', color: '#000',
                        }}>T</div>
                        <span style={{ color: '#ccf381', fontSize: '14px', fontWeight: '700', letterSpacing: '0.05em' }}>
                            Trading Journal
                        </span>
                    </div>
                    <span style={{ color: '#555', fontSize: '13px' }}>{dateStr}</span>
                </div>

                {/* MAIN CONTENT ROW */}
                <div style={{ display: 'flex', gap: '32px', flex: 1 }}>

                    {/* LEFT: Trade Info */}
                    <div style={{ flex: '0 0 auto', minWidth: '220px' }}>
                        {/* Symbol */}
                        <div style={{
                            fontSize: '42px', fontWeight: '900', color: '#ffffff',
                            letterSpacing: '-0.02em', lineHeight: 1,
                        }}>
                            {trade.symbol}
                        </div>

                        {/* Type Badge */}
                        <div style={{
                            display: 'inline-block', marginTop: '10px',
                            padding: '4px 14px', borderRadius: '100px',
                            background: trade.type === 'BUY' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: trade.type === 'BUY' ? '#4ade80' : '#f87171',
                            fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em',
                        }}>
                            {trade.type}
                        </div>

                        {/* Entry / Exit */}
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                                <span style={{ color: '#555', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', width: '28px' }}>EN</span>
                                <span style={{ color: '#e0e0e0', fontSize: '16px', fontWeight: '700', fontFamily: 'monospace' }}>
                                    {trade.entry_price?.toLocaleString()}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                                <span style={{ color: '#555', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', width: '28px' }}>EX</span>
                                <span style={{ color: '#888', fontSize: '16px', fontWeight: '600', fontFamily: 'monospace' }}>
                                    {exitPrice?.toFixed(2)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                                <span style={{ color: '#555', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', width: '28px' }}>LOT</span>
                                <span style={{ color: '#888', fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>
                                    {trade.lot_size}
                                </span>
                            </div>
                        </div>

                        {/* P&L */}
                        <div style={{ marginTop: '24px' }}>
                            <div style={{
                                fontSize: '44px', fontWeight: '900',
                                color: isProfit ? '#ccf381' : '#f87171',
                                lineHeight: 1,
                                textShadow: isProfit
                                    ? '0 0 30px rgba(204,243,129,0.4)'
                                    : '0 0 30px rgba(248,113,113,0.4)',
                            }}>
                                {isProfit ? '+' : ''}{profit < 0 ? `-$${Math.abs(profit).toLocaleString()}` : `$${profit.toLocaleString()}`}
                            </div>
                            {points !== undefined && (
                                <div style={{
                                    marginTop: '6px', fontSize: '14px', fontWeight: '700',
                                    color: isProfit ? 'rgba(204,243,129,0.6)' : 'rgba(248,113,113,0.6)',
                                }}>
                                    {points > 0 ? '+' : ''}{points?.toLocaleString()} pts
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: AI Analysis */}
                    {aiSnippet ? (
                        <div style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '20px 22px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                        }}>
                            <div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #ccf381, #a8d44e)',
                                        borderRadius: '6px', padding: '4px 8px',
                                        fontSize: '10px', fontWeight: '900', color: '#000', letterSpacing: '0.05em',
                                    }}>AI Coach</div>
                                    <span style={{ color: '#555', fontSize: '11px' }}>Analysis</span>
                                </div>
                                <p style={{
                                    color: '#aaa', fontSize: '14px', lineHeight: '1.6',
                                    margin: 0, wordBreak: 'break-word',
                                }}>
                                    {aiSnippet}
                                </p>
                            </div>
                            {trade.notes && (
                                <div style={{
                                    marginTop: '14px', paddingTop: '14px',
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', gap: '8px',
                                }}>
                                    <span style={{ fontSize: '12px' }}>📝</span>
                                    <span style={{ color: '#666', fontSize: '12px' }}>{trade.notes}</span>
                                </div>
                            )}
                        </div>
                    ) : trade.notes ? (
                        <div style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '20px 22px',
                        }}>
                            <span style={{ fontSize: '13px' }}>📝</span>
                            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', marginTop: '8px' }}>
                                {trade.notes}
                            </p>
                        </div>
                    ) : null}
                </div>

                {/* BOTTOM ROW: Username + Watermark */}
                <div style={{
                    marginTop: '24px', paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    {username ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ccf381, #6ee7b7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: '900', color: '#000',
                            }}>
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ color: '#666', fontSize: '13px', fontWeight: '600' }}>
                                {username}
                            </span>
                        </div>
                    ) : <div />}
                    <span style={{ color: '#333', fontSize: '11px', letterSpacing: '0.05em' }}>
                        trading-journal.app
                    </span>
                </div>
            </div>
        </div>
    )
}

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
        month: '2-digit', year: '2-digit'
    }) // MM/YY format for card expiry feel

    const accentColor = isProfit ? '#ccf381' : '#f87171'

    // Luxury styles
    const fontPrimary = "'Segoe UI', sans-serif"
    const fontNumbers = "'Courier New', monospace"

    return (
        <div style={{
            width: '640px',
            height: '404px', // Credit Card Ratio ~1.58
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            borderRadius: '24px',
            fontFamily: fontPrimary,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '32px 40px',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)',
        }}>
            {/* Texture Noise Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
                pointerEvents: 'none', mixBlendMode: 'overlay',
            }} />

            {/* Glossy sheen */}
            <div style={{
                position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
                background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.03) 50%, transparent 55%)',
                transform: 'rotate(-45deg)', pointerEvents: 'none',
            }} />

            {/* TOP ROW: Bank Logo + Contactless */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '28px', height: '28px',
                        background: 'linear-gradient(135deg, #ccf381, #a8d44e)',
                        borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: '900', color: '#000',
                    }}>T</div>
                    <span style={{
                        color: '#eee', fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em',
                        textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>
                        Trading Journal
                    </span>
                </div>

                {/* Contactless Symbol (CSS) */}
                <div style={{ position: 'relative', width: '24px', height: '24px', opacity: 0.6 }}>
                    <div style={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) rotate(45deg)',
                        width: '18px', height: '18px', borderRight: '2px solid #ccc', borderTop: '2px solid #ccc', borderRadius: '50%'
                    }} />
                    <div style={{
                        position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%) rotate(45deg)',
                        width: '10px', height: '10px', borderRight: '2px solid #ccc', borderTop: '2px solid #ccc', borderRadius: '50%'
                    }} />
                    <div style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(45deg)',
                        width: '2px', height: '2px', background: '#ccc', borderRadius: '50%'
                    }} />
                </div>
            </div>

            {/* MIDDLE ROW: Chip + Symbol + P&L */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '30px', position: 'relative', zIndex: 10 }}>
                {/* Left: Chip + Symbol */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* EMV Chip */}
                    <div style={{
                        width: '50px', height: '36px',
                        background: 'linear-gradient(135deg, #eebb66 0%, #aa8844 100%)',
                        borderRadius: '6px',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(0,0,0,0.2)', borderRadius: '6px' }} />
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                        <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.2)' }} />
                        <div style={{ position: 'absolute', right: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.2)' }} />
                    </div>

                    {/* Symbol (Card Number Style) */}
                    <div>
                        <div style={{
                            fontSize: '36px', fontWeight: '500', color: '#e0e0e0',
                            letterSpacing: '0.1em', textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 0 rgba(255,255,255,0.1)',
                            fontFamily: fontNumbers
                        }}>
                            {trade.symbol}
                        </div>
                        <div style={{
                            fontSize: '12px', color: isProfit ? '#4ade80' : '#f87171',
                            marginTop: '8px', letterSpacing: '0.1em', fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {trade.type} &bull; {dateStr}
                        </div>
                    </div>
                </div>

                {/* Right: P&L (Balance Style) */}
                <div style={{ textAlign: 'right', marginTop: '40px' }}>
                    <div style={{ fontSize: '9px', color: '#666', letterSpacing: '0.1em', fontWeight: '600', marginBottom: '4px' }}>ACCOUNT BALANCE</div>
                    <div style={{
                        fontSize: '48px', fontWeight: 'bold',
                        color: accentColor,
                        letterSpacing: '-0.02em',
                        textShadow: '0 0 20px rgba(0,0,0,0.5)',
                        fontFamily: fontPrimary
                    }}>
                        {isProfit ? '+' : ''}{profit < 0 ? `-$${Math.abs(profit).toLocaleString()}` : `$${profit.toLocaleString()}`}
                    </div>
                    {points !== undefined && points !== 0 && (
                        <div style={{ fontSize: '14px', color: '#888', marginTop: '-4px', fontWeight: '500' }}>
                            {points > 0 ? '+' : ''}{points.toLocaleString()} pts
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM ROW: Details + Name */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
                {/* Name */}
                <div>
                    <div style={{ fontSize: '8px', color: '#666', letterSpacing: '0.1em', marginBottom: '4px' }}>CARD HOLDER</div>
                    <div style={{
                        fontSize: '18px', color: '#ddd', textTransform: 'uppercase',
                        letterSpacing: '0.15em', fontWeight: '500',
                        textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
                    }}>
                        {username || 'TRADER'}
                    </div>
                </div>

                {/* Trade Details (Expiry Style) */}
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                        <div style={{ fontSize: '7px', color: '#666', marginBottom: '2px' }}>ENTRY</div>
                        <div style={{ fontSize: '14px', color: '#ccc', fontFamily: fontNumbers, fontWeight: 'bold' }}>{trade.entry_price?.toLocaleString()}</div>
                    </div>
                    {exitPrice && (
                        <div>
                            <div style={{ fontSize: '7px', color: '#666', marginBottom: '2px' }}>EXIT</div>
                            <div style={{ fontSize: '14px', color: '#ccc', fontFamily: fontNumbers, fontWeight: 'bold' }}>{exitPrice.toFixed(2)}</div>
                        </div>
                    )}
                    <div>
                        <div style={{ fontSize: '7px', color: '#666', marginBottom: '2px' }}>LOT</div>
                        <div style={{ fontSize: '14px', color: '#ccc', fontFamily: fontNumbers, fontWeight: 'bold' }}>{trade.lot_size}</div>
                    </div>
                </div>
            </div>

            {/* Bottom Right Watermark (Subtle) */}
            <div style={{
                position: 'absolute', bottom: '34px', right: '40px',
                fontSize: '10px', color: '#333', fontWeight: 'bold',
                letterSpacing: '0.1em',
                transform: 'translateY(100%)' // Move below the details
            }}>
                CRT.TRADER community
            </div>
        </div>
    )
}

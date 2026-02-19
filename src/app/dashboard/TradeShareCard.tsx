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

    const dateObj = new Date(trade.created_at)
    const expiryDate = dateObj.toLocaleDateString('en-GB', {
        month: '2-digit', year: '2-digit'
    }) // MM/YY format

    const accentColor = isProfit ? '#ccf381' : '#f87171'

    // Luxury fonts
    const fontPrimary = "'Segoe UI', sans-serif"
    const fontMono = "'Courier New', monospace"

    return (
        <div style={{
            width: '600px',
            height: '360px', // Reduced height per user request
            background: 'linear-gradient(135deg, #1a1a1a 0%, #050505 100%)',
            borderRadius: '20px',
            fontFamily: fontPrimary,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.5)',
            color: '#e0e0e0',
        }}>
            {/* Background Texture (Simple) */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)',
                pointerEvents: 'none',
            }} />

            {/* HEADER: Logo + Contactless (Absolute Top) */}
            <div style={{ position: 'absolute', top: '28px', left: '32px', right: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '24px', height: '24px',
                        background: 'linear-gradient(135deg, #ccf381, #a8d44e)',
                        borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '900', color: '#000',
                    }}>T</div>
                    <span style={{
                        color: '#ddd', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        Trading Journal
                    </span>
                </div>
                {/* Contactless Icon */}
                <div style={{ position: 'relative', width: '20px', height: '20px', opacity: 0.5 }}>
                    <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', borderRight: '2px solid #ccc', height: '12px', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', borderRight: '2px solid #ccc', height: '8px', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', borderRight: '2px solid #ccc', height: '4px', borderRadius: '50%' }} />
                </div>
            </div>

            {/* CHIP (Absolute) */}
            <div style={{
                position: 'absolute', top: '80px', left: '32px',
                width: '44px', height: '34px',
                background: 'linear-gradient(135deg, #eebb66 0%, #aa8844 100%)',
                borderRadius: '5px',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.3)'
            }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.15)' }} />
                <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.15)' }} />
                <div style={{ position: 'absolute', right: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.15)' }} />
            </div>

            {/* MAIN NUMBER: Symbol (Absolute Center-ish) */}
            <div style={{
                position: 'absolute', top: '140px', left: '32px', right: '32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <div style={{
                        fontSize: '32px', fontWeight: '500', color: '#e0e0e0',
                        letterSpacing: '0.15em', textShadow: '1px 1px 1px black, -1px -1px 0 rgba(255,255,255,0.1)',
                        fontFamily: fontMono, marginBottom: '8px'
                    }}>
                        {trade.symbol}
                    </div>
                    {/* Small details below symbol */}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '9px', color: '#888', letterSpacing: '0.1em' }}>
                        <div>
                            <span style={{ display: 'block', marginBottom: '2px', fontSize: '6px' }}>TYPE</span>
                            <span style={{ color: isProfit ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{trade.type}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', marginBottom: '2px', fontSize: '6px' }}>DATE</span>
                            <span style={{ color: '#ccc' }}>{expiryDate}</span>
                        </div>
                    </div>
                </div>

                {/* P&L (Right Aligned) */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '42px', fontWeight: 'bold',
                        color: accentColor,
                        letterSpacing: '-0.02em',
                        textShadow: '0 0 15px rgba(0,0,0,0.5)',
                        lineHeight: 1
                    }}>
                        {isProfit ? '+' : ''}{profit < 0 ? `-$${Math.abs(profit).toLocaleString()}` : `$${profit.toLocaleString()}`}
                    </div>
                    {points !== undefined && points !== 0 && (
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', fontWeight: '600' }}>
                            {points > 0 ? '+' : ''}{points.toLocaleString()} pts
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM INFO (Absolute Bottom) */}
            <div style={{
                position: 'absolute', bottom: '28px', left: '32px', right: '32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
            }}>
                {/* Name */}
                <div>
                    <div style={{ fontSize: '7px', color: '#666', letterSpacing: '0.1em', marginBottom: '4px' }}>CARD HOLDER</div>
                    <div style={{
                        fontSize: '14px', color: '#ddd', textTransform: 'uppercase',
                        letterSpacing: '0.15em', fontWeight: '500',
                        textShadow: '1px 1px 0 black',
                    }}>
                        {username || 'TRADER'}
                    </div>
                </div>

                {/* Trade Stats (Entry/Exit/Lot) */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                        <div style={{ fontSize: '7px', color: '#555', marginBottom: '2px', textAlign: 'right' }}>ENTRY</div>
                        <div style={{ fontSize: '12px', color: '#bbb', fontFamily: fontMono, fontWeight: 'bold' }}>{trade.entry_price?.toLocaleString()}</div>
                    </div>
                    {exitPrice && (
                        <div>
                            <div style={{ fontSize: '7px', color: '#555', marginBottom: '2px', textAlign: 'right' }}>EXIT</div>
                            <div style={{ fontSize: '12px', color: '#bbb', fontFamily: fontMono, fontWeight: 'bold' }}>{exitPrice.toFixed(2)}</div>
                        </div>
                    )}
                    <div>
                        <div style={{ fontSize: '7px', color: '#555', marginBottom: '2px', textAlign: 'right' }}>LOT</div>
                        <div style={{ fontSize: '12px', color: '#bbb', fontFamily: fontMono, fontWeight: 'bold' }}>{trade.lot_size}</div>
                    </div>
                </div>
            </div>

            {/* Watermark (Very small, bottom center) */}
            <div style={{
                position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '8px', color: '#333', letterSpacing: '0.2em', fontWeight: 'bold',
                display: 'none' // Hidden for cleaner credit card look, or enable if needed
            }}>
                CRT.TRADER
            </div>
        </div>
    )
}

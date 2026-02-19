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

    const accentColor = isProfit ? '#4ade80' : '#f87171'

    // Luxury fonts
    const fontPrimary = "'Segoe UI', sans-serif"
    const fontMono = "'Courier New', monospace"
    const fontSlab = "'Rockwell', 'Courier New', serif" // Stronger text for symbol

    return (
        <div style={{
            width: '600px',
            height: '330px', // Further Reduced height (Ultra-sleek ratio)
            background: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)', // Gunmetal/Charcoal
            borderRadius: '16px',
            fontFamily: fontPrimary,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 30px 60px -12px rgba(0,0,0,0.7)',
            color: '#e0e0e0',
        }}>
            {/* Brushed Metal Texture */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='0.05' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
                opacity: 0.8,
                pointerEvents: 'none',
            }} />

            {/* Titanium Sheen */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 40%, rgba(255,255,255,0.02) 100%)',
                pointerEvents: 'none',
            }} />


            {/* HEADER: Logo + Contactless (Absolute Top) */}
            <div style={{ position: 'absolute', top: '24px', left: '32px', right: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '24px', height: '24px',
                        background: 'linear-gradient(135deg, #d1d5db, #9ca3af)', // Silver/Grey Logo
                        borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '900', color: '#1f2937',
                    }}>T</div>
                    <span style={{
                        color: '#d1d5db', fontSize: '11px', fontWeight: '800', letterSpacing: '0.15em',
                        textTransform: 'uppercase'
                    }}>
                        TITANIUM
                    </span>
                </div>
                {/* Contactless Icon */}
                <div style={{ position: 'relative', width: '20px', height: '20px', opacity: 0.6 }}>
                    <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', borderRight: '2px solid #ccc', height: '14px', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', borderRight: '2px solid #ccc', height: '10px', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', borderRight: '2px solid #ccc', height: '6px', borderRadius: '50%' }} />
                </div>
            </div>

            {/* CHIP (Absolute) */}
            <div style={{
                position: 'absolute', top: '75px', left: '32px',
                width: '40px', height: '30px',
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8833 100%)', // Gold Chip looks good on Titanium
                borderRadius: '5px',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.5)',
                border: '1px solid #b8860b'
            }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.2)' }} />
                <div style={{ position: 'absolute', right: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.2)' }} />
            </div>

            {/* MAIN NUMBER: Symbol (Absolute Center-ish) */}
            <div style={{
                position: 'absolute', top: '125px', left: '32px', right: '32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
                <div>
                    <div style={{
                        fontSize: '32px', fontWeight: '500', color: '#f3f4f6',
                        letterSpacing: '0.12em', textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 0 rgba(255,255,255,0.05)',
                        fontFamily: fontSlab, marginBottom: '14px', lineHeight: '1'
                    }}>
                        {trade.symbol}
                    </div>
                    {/* Details below symbol with MORE spacing to avoid overlap */}
                    <div style={{ display: 'flex', gap: '20px', fontSize: '10px', letterSpacing: '0.08em', alignItems: 'center' }}>
                        <span style={{
                            color: isProfit ? '#22c55e' : '#ef4444', fontWeight: 'bold',
                            textTransform: 'uppercase', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px',
                            border: `1px solid ${isProfit ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>{trade.type}</span>
                        <span style={{ color: '#9ca3af', fontFamily: fontMono, fontWeight: 'bold' }}>{expiryDate}</span>
                    </div>
                </div>

                {/* P&L (Right Aligned) */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '44px', fontWeight: 'bold',
                        color: accentColor,
                        letterSpacing: '-0.03em',
                        textShadow: '0 0 25px rgba(0,0,0,0.6)',
                        lineHeight: '1', marginBottom: '4px'
                    }}>
                        {isProfit ? '+' : ''}{profit < 0 ? `-$${Math.abs(profit).toLocaleString()}` : `$${profit.toLocaleString()}`}
                    </div>
                    {points !== undefined && points !== 0 && (
                        <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '600', fontFamily: fontPrimary }}>
                            {points > 0 ? '+' : ''}{points.toLocaleString()} pts
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM INFO (Absolute Bottom) */}
            <div style={{
                position: 'absolute', bottom: '26px', left: '32px', right: '32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
            }}>
                {/* Name */}
                <div style={{ transform: 'translateY(2px)' }}>
                    <div style={{ fontSize: '7px', color: '#6b7280', letterSpacing: '0.15em', marginBottom: '4px', fontWeight: '700' }}>CARD HOLDER</div>
                    <div style={{
                        fontSize: '15px', color: '#e5e7eb', textTransform: 'uppercase',
                        letterSpacing: '0.15em', fontWeight: '600',
                        textShadow: '1px 1px 1px rgba(0,0,0,0.8)',
                    }}>
                        {username || 'TRADER'}
                    </div>
                </div>

                {/* Trade Stats (Entry/Exit/Lot) */}
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '7px', color: '#6b7280', marginBottom: '3px', fontWeight: '700', letterSpacing: '0.1em' }}>ENTRY</div>
                        <div style={{ fontSize: '12px', color: '#d1d5db', fontFamily: fontMono, fontWeight: 'bold' }}>{trade.entry_price?.toLocaleString()}</div>
                    </div>
                    {exitPrice && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '7px', color: '#6b7280', marginBottom: '3px', fontWeight: '700', letterSpacing: '0.1em' }}>EXIT</div>
                            <div style={{ fontSize: '12px', color: '#d1d5db', fontFamily: fontMono, fontWeight: 'bold' }}>{exitPrice.toFixed(2)}</div>
                        </div>
                    )}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '7px', color: '#6b7280', marginBottom: '3px', fontWeight: '700', letterSpacing: '0.1em' }}>LOT</div>
                        <div style={{ fontSize: '12px', color: '#d1d5db', fontFamily: fontMono, fontWeight: 'bold' }}>{trade.lot_size}</div>
                    </div>
                </div>
            </div>

            {/* Hologram Sticker (Bottom Right Accent) */}
            <div style={{
                position: 'absolute', bottom: '80px', right: '32px',
                width: '40px', height: '24px',
                background: 'linear-gradient(135deg, silver, white, silver)',
                borderRadius: '4px', opacity: 0.15,
                transform: 'skewX(-20deg)'
            }} />

        </div>
    )
}

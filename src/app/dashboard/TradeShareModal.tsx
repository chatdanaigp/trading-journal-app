'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { motion } from 'framer-motion'
import { TradeShareCard } from './TradeShareCard'
import { X, Download, Loader2 } from 'lucide-react'

interface TradeShareModalProps {
    trade: any
    username?: string
    onClose: () => void
}

export function TradeShareModal({ trade, username, onClose }: TradeShareModalProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [downloading, setDownloading] = useState(false)

    const profit = Number(trade.profit) || 0
    const lot = trade.lot_size || 0.01
    const points = lot !== 0 ? Math.round(profit / lot) : 0

    const handleDownload = async () => {
        if (!cardRef.current) return
        setDownloading(true)
        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2, // Retina quality
            })
            const link = document.createElement('a')
            link.download = `trade-${trade.symbol}-${new Date(trade.created_at).toISOString().split('T')[0]}.png`
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error('Failed to export image:', err)
        } finally {
            setDownloading(false)
        }
    }

    return (
        // Backdrop
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="flex flex-col items-center gap-5 w-full max-w-4xl"
            >

                {/* Header */}
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h2 className="text-white font-bold text-xl">Share Trade Card</h2>
                        <p className="text-gray-500 text-sm mt-0.5">Preview → Download PNG → Post anywhere</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-white hover:bg-[#252525] transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Card Preview */}
                <div
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{ maxWidth: '800px', width: '100%' }}
                >
                    {/* This ref is what gets captured */}
                    <div ref={cardRef} style={{ display: 'inline-block', lineHeight: 0 }}>
                        <TradeShareCard trade={trade} username={username} points={points} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center gap-2 px-6 py-3 bg-[#ccf381] hover:bg-[#bbe075] text-black font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    >
                        {downloading
                            ? <><Loader2 size={16} className="animate-spin" /> Exporting…</>
                            : <><Download size={16} /> Download PNG</>
                        }
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-3 bg-[#1a1a1a] border border-[#333] text-gray-400 hover:text-white rounded-xl transition-all text-sm font-medium"
                    >
                        Close
                    </button>
                </div>

                <p className="text-gray-600 text-xs">
                    💡 ดาวน์โหลดแล้วโพสต์บน Twitter/X, Facebook, หรือ Discord ได้เลย
                </p>
            </motion.div>
        </motion.div>
    )
}

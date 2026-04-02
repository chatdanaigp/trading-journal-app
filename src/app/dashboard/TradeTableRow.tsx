import React, { memo } from 'react'
import Image from 'next/image'
import { Share2, Trash2, ImageIcon, Eye, Edit2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { getTradingDay } from '@/utils/date-helpers'
import type { HistoryTradeRecord } from '@/types/models'

interface TradeTableRowProps {
    t: HistoryTradeRecord
    isUSC: boolean
    deletingId: string | null
    onView: (trade: HistoryTradeRecord) => void
    onShare: (trade: HistoryTradeRecord) => void
    onEdit: (trade: HistoryTradeRecord) => void
    onDelete: (id: string) => void
}

export const TradeTableRow = memo(function TradeTableRow({ 
    t, isUSC, deletingId, onView, onShare, onEdit, onDelete 
}: TradeTableRowProps) {
    const profitValue = t.profit || 0
    const isProfit = profitValue > 0.01
    const isLoss = profitValue < -0.01
    const isBE = !isProfit && !isLoss

    const lot = t.lot_size || 0.01
    const pts = lot !== 0 ? Math.abs(Math.round(profitValue / lot)) : 0

    // Calculate RR: Actual Points / Planned SL Distance (Pts)
    const slPoints = t.stop_loss || 0

    let actualRRDisplay = "1:0"
    if (slPoints > 0) {
        const rrValue = pts / slPoints
        const formattedRR = rrValue % 1 === 0 ? rrValue.toFixed(0) : rrValue.toFixed(2)
        actualRRDisplay = `1:${formattedRR}`
    }

    const createdAt = t.created_at ? new Date(t.created_at) : null
    const tradingDay = t.created_at ? getTradingDay(t.created_at) : null
    const dayOfWeek = tradingDay?.getDay() ?? 0
    let dayBorderColor = "border-l-transparent"

    switch (dayOfWeek) {
        case 1: dayBorderColor = "border-l-[4px] border-l-[#facc15]"; break
        case 2: dayBorderColor = "border-l-[4px] border-l-[#f472b6]"; break
        case 3: dayBorderColor = "border-l-[4px] border-l-[#4ade80]"; break
        case 4: dayBorderColor = "border-l-[4px] border-l-[#fb923c]"; break
        case 5: dayBorderColor = "border-l-[4px] border-l-[#60a5fa]"; break
        default: dayBorderColor = "border-l-[4px] border-l-gray-600"
    }

    return (
        <tr className={cn("group hover:bg-white/[0.02] transition-colors border-b border-white/[0.05] last:border-0 h-20", dayBorderColor)}>
            <td className="px-5 py-3">
                <div className="flex flex-col">
                    <span className="text-white font-bold text-base truncate">{t.symbol || 'XAUUSD'}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500 text-[10px]">
                            {createdAt
                                ? `${createdAt.toLocaleDateString('th-TH')} • ${createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
                                : 'No timestamp'}
                        </span>
                        {t.strategy && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 whitespace-nowrap">#{t.strategy}</span>}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-center">
                <span className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-black tracking-widest",
                    t.type === 'BUY' ? "bg-[#ccf381]/10 text-[#ccf381] border border-[#ccf381]/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                )}>
                    {t.type}
                </span>
            </td>
            <td className="px-4 py-3 text-center">
                <span className="text-white font-black text-sm">{t.lot_size}</span>
            </td>
            <td className="px-4 py-3 text-center">
                <span className="text-white font-bold text-sm tracking-tight">{t.entry_price?.toLocaleString()}</span>
            </td>
            <td className="px-4 py-3 text-center">
                <span className="text-white/70 font-medium text-sm tracking-tight">{t.exit_price?.toLocaleString() || '-'}</span>
            </td>
            <td className="px-4 py-3 text-center">
                {t.profit !== undefined ? (
                    <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                        {!isBE && <div className={cn("w-1.5 h-1.5 rounded-full", isProfit ? "bg-[#ccf381]" : "bg-red-500")} />}
                        <span className={isProfit ? "text-[#ccf381]" : isLoss ? "text-red-500" : "text-white"}>
                            {isBE ? "BE" : pts.toLocaleString()}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-600 text-xs">-</span>
                )}
            </td>
            <td className="px-4 py-3 text-center">
                <div className={cn(
                    "inline-flex px-2 py-1 rounded border",
                    isProfit ? "bg-[#ccf381]/5 border-[#ccf381]/10" : "bg-red-500/5 border-red-500/10"
                )}>
                    <span className={cn(
                        "text-xs font-black font-mono",
                        isProfit ? "text-[#ccf381]/80" : "text-red-400/80"
                    )}>{actualRRDisplay}</span>
                </div>
            </td>
            <td className="px-5 py-3 text-center">
                <div className={cn(
                    "text-base font-black tracking-tight",
                    isBE ? 'text-white' : isProfit ? 'text-[#ccf381] drop-shadow-[0_0_8px_rgba(204,243,129,0.4)]' : 'text-red-500'
                )}>
                    {isBE ? (isUSC ? "0 USC" : "$0") : isProfit ? `+${isUSC ? '' : '$'}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(profitValue)}${isUSC ? ' USC' : ''}` : `${isUSC ? '' : '$'}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(profitValue)}${isUSC ? ' USC' : ''}`}
                </div>
            </td>
            <td className="px-5 py-3 transition-all duration-300">
                <div className="flex items-center justify-end gap-3 px-1">
                    <button
                        onClick={() => onView(t)}
                        className="group/detail relative shrink-0"
                    >
                        {/* Large Screen: Show Thumbnail */}
                        <div className={cn(
                            "hidden xl:block overflow-hidden rounded border transition-colors relative",
                            t.screenshot_url ? "w-20 h-12 border-white/10 group-hover/detail:border-[#ccf381]/40" : "w-20 h-12 bg-white/5 border-white/10 group-hover/detail:bg-white/10"
                        )}>
                            {t.screenshot_url ? (
                                <Image src={t.screenshot_url} alt="Chart" fill unoptimized className="object-cover" sizes="80px" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Eye size={12} className="text-gray-500 group-hover/detail:text-white" />
                                </div>
                            )}
                        </div>

                        {/* Small Screen: Show Compact Icon Button */}
                        <div className={cn(
                            "xl:hidden p-1.5 rounded-lg transition-all",
                            t.screenshot_url ? "bg-[#ccf381]/10 text-[#ccf381]/60 hover:text-[#ccf381] hover:bg-[#ccf381]/20" : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                        )}>
                            <ImageIcon size={14} />
                        </div>
                    </button>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onShare(t)}
                            className="p-1.5 bg-[#ccf381]/10 hover:bg-[#ccf381]/20 rounded-lg text-[#ccf381]/60 hover:text-[#ccf381] transition-all"
                            title="Share Trade Card"
                        >
                            <Share2 size={14} />
                        </button>
                        <button
                            onClick={() => onEdit(t)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                            title="Edit Trade"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => onDelete(t.id)}
                            disabled={deletingId === t.id}
                            className={`p-1.5 rounded-lg transition-all ${deletingId === t.id ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300'}`}
                            title="Delete Trade"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    )
})

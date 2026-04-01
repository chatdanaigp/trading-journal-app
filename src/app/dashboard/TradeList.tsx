'use client'

import Image from 'next/image'
import React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, Trash2, ImageIcon, X, Eye, ArrowUpRight, ArrowDownRight, Clock, Target, Shield, TrendingUp, Hash, BarChart3, Zap, Edit2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Card, CardContent } from '@/components/ui/card'
import { useSWRConfig } from 'swr'
import { deleteTrade } from './actions'
import { EditTradeForm } from './EditTradeForm'
import { TradeShareModal } from './TradeShareModal'
import { cn } from '@/utils/cn'
import { getTradingDay } from '@/utils/date-helpers'
import type { dictionaries } from '@/utils/dictionaries'
import type { HistoryTradeRecord } from '@/types/models'

type AppDictionary = typeof dictionaries.EN

export function TradeList({ trades, username, dict, className, hideHeader, currency }: { trades: HistoryTradeRecord[]; username?: string; dict?: AppDictionary; className?: string; hideHeader?: boolean; currency?: string }) {
    const isUSC = currency === 'USC'
    const [editingTrade, setEditingTrade] = useState<HistoryTradeRecord | null>(null)
    const [sharingTrade, setSharingTrade] = useState<HistoryTradeRecord | null>(null)
    const [viewingTrade, setViewingTrade] = useState<HistoryTradeRecord | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null)
    const { mutate } = useSWRConfig()

    async function handleDelete(tradeId: string) {
        if (!confirm('Are you sure you want to delete this trade?')) return
        setDeletingId(tradeId)
        await deleteTrade(tradeId)
        mutate((key: unknown) => typeof key === 'string' && key.startsWith('/api/'))
        setDeletingId(null)
    }

    return (
        <>
            <Card className={cn("relative overflow-hidden border-0 shadow-2xl h-full flex flex-col bg-[#0d0d0d]", className)}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505] z-0" />
                <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                
                <CardContent className="p-6 relative z-10 flex flex-1 min-h-0 flex-col">
                    {!hideHeader && (
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">{dict?.dashboard?.recentTransactions || "Recent Transactions"}</h2>
                            <Link href="/journal" className="text-sm text-[#ccf381] hover:underline">{dict?.dashboard?.viewJournal || "View Journal"}</Link>
                        </div>
                    )}

                    <div className="flex flex-1 min-h-0 flex-col p-0">
                        {trades.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                                        <BarChart3 className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 mb-1">{dict?.dashboard?.noTradesWait || "No trades yet."}</p>
                                    <p className="text-xs text-gray-600">{dict?.dashboard?.quickTrade ? `↑ ${dict.dashboard.quickTrade}` : '↑ Log your first trade above'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar overflow-x-hidden rounded-xl border border-white/5 bg-black/20">
                                <table className="w-full text-left relative table-fixed">
                                    <thead className="bg-[#1a1a1a] text-gray-400 text-[12px] uppercase tracking-wider sticky top-0 z-40 shadow-md">
                                        <tr>
                                            <th className="px-5 py-3 rounded-tl-xl w-[20%]">{dict?.dashboard?.asset || "Asset"}</th>
                                            <th className="px-4 py-3 text-center w-[9%]">Side</th>
                                            <th className="px-4 py-3 text-center w-[8%]">Lot</th>
                                            <th className="px-4 py-2 text-center w-[9%]">Entry</th>
                                            <th className="px-4 py-2 text-center w-[9%]">Exit</th>
                                            <th className="px-4 py-2 text-center w-[9%]">P&L (Pts)</th>
                                            <th className="px-4 py-2 text-center w-[9%]">RR</th>
                                            <th className="px-5 py-3 text-center w-[9%]">{dict?.dashboard?.result || "Result"}</th>
                                            <th className="px-5 py-3 rounded-tr-xl w-[18%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[...trades].sort((a, b) => {
                                            const timeA = new Date(a.created_at || 0).getTime()
                                            const timeB = new Date(b.created_at || 0).getTime()
                                            if (timeA !== timeB) return timeB - timeA
                                            return (b.id || '').localeCompare(a.id || '')
                                        }).map((t) => {
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
                                                <tr key={t.id} className={cn("group hover:bg-white/[0.02] transition-colors border-b border-white/[0.05] last:border-0 h-20", dayBorderColor)}>
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
                                                                onClick={() => setViewingTrade(t)}
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
                                                                    onClick={() => setSharingTrade(t)}
                                                                    className="p-1.5 bg-[#ccf381]/10 hover:bg-[#ccf381]/20 rounded-lg text-[#ccf381]/60 hover:text-[#ccf381] transition-all"
                                                                    title="Share Trade Card"
                                                                >
                                                                    <Share2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingTrade(t)}
                                                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                                                    title="Edit Trade"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(t.id)}
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
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modal for Editing */}
            <Modal
                isOpen={!!editingTrade}
                onClose={() => setEditingTrade(null)}
                title="Edit Trade"
            >
                {editingTrade && (
                    <EditTradeForm
                        initialData={editingTrade}
                        onSuccess={() => setEditingTrade(null)}
                    />
                )}
            </Modal>

            {/* Trade Detail Modal */}
            <Modal
                isOpen={!!viewingTrade}
                onClose={() => setViewingTrade(null)}
                title={viewingTrade ? `${viewingTrade.symbol} Trade Detail` : ''}
                maxWidth="max-w-5xl"
            >
                {viewingTrade && (() => {
                    const t = viewingTrade
                    const tDate = t.created_at ? new Date(t.created_at) : null
                    const lot = t.lot_size || 0.01
                    const p = Math.round((t.profit || 0) * 100) / 100
                    const pts = lot !== 0 ? Math.abs(Math.round(p / lot)) : 0

                    const isProfit = p > 0.01
                    const isLoss = p < -0.01
                    const isBE = !isProfit && !isLoss

                    let actualRRDisplay = "1:0"
                    const slPoints = t.stop_loss || 0

                    if (slPoints > 0) {
                        const rrValue = pts / slPoints
                        const formattedRR = rrValue % 1 === 0 ? rrValue.toFixed(0) : rrValue.toFixed(2)
                        actualRRDisplay = `1:${formattedRR}`
                    }

                    return (
                        <div className="flex flex-col gap-6">
                            {/* Desktop/Tablet side-by-side layout */}
                            <div className={cn(
                                "flex flex-col lg:flex-row gap-6",
                                !t.screenshot_url && "lg:flex-col"
                            )}>
                                {/* Left Side: Screenshot (if exists) */}
                                {t.screenshot_url && (
                                    <div className="lg:flex-1">
                                        <div
                                            className="w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 cursor-pointer group relative shadow-2xl"
                                            onClick={() => { setViewingTrade(null); setViewingScreenshot(t.screenshot_url ?? null) }}
                                        >
                                            <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[500px]">
                                                <Image src={t.screenshot_url} alt="Trade Chart" fill unoptimized className="object-contain" sizes="(min-width: 1024px) 60vw, 100vw" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                                                    <Eye size={16} className="text-white" />
                                                    <span className="text-white text-xs font-bold uppercase tracking-wider">Expand Chart</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Right Side: Stats Container */}
                                <div className={cn("flex flex-col gap-4", t.screenshot_url ? "lg:w-[320px]" : "w-full")}>
                                    {/* Result Banner (Compact) */}
                                    <div className={cn(
                                        "rounded-2xl p-5 border flex items-center justify-between",
                                        Math.abs(p) < 0.01 ? "bg-gray-500/5 border-gray-500/20" :
                                            p > 0 ? "bg-[#ccf381]/5 border-[#ccf381]/20 shadow-[0_0_20px_rgba(204,243,129,0.05)]" : "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                                    )}>
                                        <div className="flex flex-col">
                                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">P&L Result</p>
                                            <p className={cn("text-3xl font-black tracking-tight",
                                                Math.abs(p) < 0.01 ? 'text-white' : p > 0 ? 'text-[#ccf381]' : 'text-red-400'
                                            )}>
                                                {Math.abs(p) < 0.01 ? (isUSC ? "0 USC" : "$0") : p > 0 ? `+${isUSC ? '' : '$'}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(p)}${isUSC ? ' USC' : ''}` : `${isUSC ? '' : '$'}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(p)}${isUSC ? ' USC' : ''}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-sm font-black",
                                                Math.abs(pts) < 0.01 ? 'text-gray-500' : isProfit ? 'text-[#ccf381]/80' : 'text-red-400/80'
                                            )}>
                                                {isProfit ? '+' : '-'}{pts.toLocaleString()} PTS
                                            </p>
                                            <div className={cn("mt-1 text-[10px] font-black px-2 py-0.5 rounded-full border inline-block uppercase tracking-tighter",
                                                slPoints > 0 && (pts / slPoints) >= 2 ? 'bg-[#ccf381]/10 border-[#ccf381]/20 text-[#ccf381]' :
                                                    slPoints > 0 && (pts / slPoints) >= 1 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/10 border-red-500/20 text-red-400'
                                            )}>
                                                RR {actualRRDisplay}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Information Grid (Compact) */}
                                    <div className={cn(
                                        "grid gap-2.5",
                                        t.screenshot_url ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                                    )}>
                                        <DetailItem icon={<Clock size={12} />} label="Timestamp" value={tDate ? `${tDate.toLocaleDateString('th-TH')} • ${tDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : 'No timestamp'} />
                                        <DetailItem icon={t.type === 'BUY' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} label="Type" value={t.type ?? '-'} valueClass={t.type === 'BUY' ? 'text-green-400' : 'text-red-400'} />
                                        <DetailItem icon={<TrendingUp size={12} />} label="Volume" value={String(t.lot_size)} />
                                        <DetailItem icon={<BarChart3 size={12} />} label="Strategy" value={t.strategy || '-'} valueClass="text-[#ccf381]" />
                                        <DetailItem icon={<Target size={12} />} label="Entry" value={t.entry_price?.toLocaleString() ?? '-'} />
                                        <DetailItem icon={<Zap size={12} />} label="Exit" value={t.exit_price?.toLocaleString() ?? '-'} />
                                        <DetailItem icon={isProfit ? <Target size={12} /> : isLoss ? <Shield size={12} /> : <TrendingUp size={12} />} label={isProfit ? "Take Profit" : isLoss ? "Stop Loss" : "Breakeven"} value={isBE ? "BE" : pts.toLocaleString()} valueClass={isProfit ? "text-[#ccf381]" : isLoss ? "text-red-400" : "text-white"} />
                                        <DetailItem icon={<Hash size={12} />} label="Actual RR" value={actualRRDisplay} valueClass={slPoints > 0 && (pts / slPoints) >= 1 ? "text-[#ccf381]" : isBE ? "text-white" : "text-red-400"} />
                                    </div>

                                    {/* Notes (Compact inside right col) */}
                                    {t.notes && (
                                        <div className="bg-[#111] rounded-2xl p-4 border border-white/5 shadow-inner">
                                            <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <TrendingUp size={10} /> Trade Notes
                                            </p>
                                            <p className="text-gray-300 text-xs leading-relaxed font-medium">{t.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })()}
            </Modal>

            {/* Modal for Sharing */}
            {sharingTrade && (
                <TradeShareModal
                    trade={sharingTrade}
                    username={username}
                    onClose={() => setSharingTrade(null)}
                    currency={currency}
                />
            )}

            {/* Screenshot Lightbox */}
            {viewingScreenshot && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-300"
                    onClick={() => setViewingScreenshot(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setViewingScreenshot(null)}
                    >
                        <X size={24} />
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-2">
                        <div
                            className="relative w-full h-full max-w-full max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={viewingScreenshot}
                                alt="Trade Chart"
                                fill
                                unoptimized
                                className="rounded-xl border border-white/10 shadow-2xl object-contain animate-in zoom-in-95 duration-300"
                                sizes="100vw"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function DetailItem({ icon, label, value, valueClass }: { icon: React.ReactNode, label: string, value: string, valueClass?: string }) {
    return (
        <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 opacity-50">
                {icon}
                <p className="text-[11px] font-black uppercase tracking-widest">{label}</p>
            </div>
            <p className={cn("text-base font-bold text-white truncate", valueClass)}>{value || '—'}</p>
        </div>
    )
}

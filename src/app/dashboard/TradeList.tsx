'use client'

import React from 'react'

import { useState } from 'react'
import { Pencil, Share2, Trash2, ImageIcon, X, Eye, ArrowUpRight, ArrowDownRight, Clock, Target, Shield, TrendingUp, Hash, BarChart3, Zap } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useSWRConfig } from 'swr'
import { deleteTrade } from './actions'
import { EditTradeForm } from './EditTradeForm'
import { TradeShareModal } from './TradeShareModal'
import { cn } from '@/utils/cn'
import { getTradingDay } from '@/utils/date-helpers'

export function TradeList({ trades, username, dict, className, hideHeader }: { trades: any[], username?: string, dict?: any, className?: string, hideHeader?: boolean }) {
    const [editingTrade, setEditingTrade] = useState<any | null>(null)
    const [sharingTrade, setSharingTrade] = useState<any | null>(null)
    const [viewingTrade, setViewingTrade] = useState<any | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null)
    const { mutate } = useSWRConfig()

    async function handleDelete(tradeId: string) {
        if (!confirm('Are you sure you want to delete this trade?')) return
        setDeletingId(tradeId)
        await deleteTrade(tradeId)
        mutate((key: any) => typeof key === 'string' && key.startsWith('/api/'))
        setDeletingId(null)
    }

    return (
        <>
            {!hideHeader && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">{dict?.dashboard?.recentTransactions || "Recent Transactions"}</h2>
                    <a href="/journal" className="text-sm text-[#ccf381] hover:underline">{dict?.dashboard?.viewJournal || "View Journal"}</a>
                </div>
            )}

            <div className={cn("bg-[#1a1a1a] rounded-2xl overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar", className)}>
                {trades.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">{dict?.dashboard?.noTradesWait || "No trades yet."}</div>
                ) : (
                    <table className="w-full text-left min-w-[700px] relative table-fixed">
                        <thead className="bg-[#2a2a2a] text-gray-400 text-[10px] uppercase tracking-wider sticky top-0 z-40 shadow-md">
                            <tr>
                                <th className="px-5 py-3 rounded-tl-xl w-[20%]">{dict?.dashboard?.asset || "Asset"}</th>
                                <th className="px-4 py-3 text-center w-[8%]">Side</th>
                                <th className="px-4 py-3 text-center w-[8%]">Lot</th>
                                <th className="px-4 py-3 w-[10%]">Entry</th>
                                <th className="px-4 py-3 w-[10%]">Exit</th>
                                <th className="px-4 py-3 w-[10%]">SL / TP</th>
                                <th className="px-4 py-3 text-center w-[10%]">RR</th>
                                <th className="px-5 py-3 text-right w-[12%]">{dict?.dashboard?.result || "Result"}</th>
                                <th className="px-5 py-3 w-[12%]">Detail</th>
                                <th className="px-5 py-3 text-center rounded-tr-xl w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {[...trades].sort((a, b) => {
                                const timeA = new Date(a.created_at || 0).getTime()
                                const timeB = new Date(b.created_at || 0).getTime()
                                if (timeA !== timeB) return timeB - timeA
                                return (b.id || '').localeCompare(a.id || '')
                            }).map((trade) => {
                                const lot = trade.lot_size || 0.01
                                const rawProfit = trade.profit || 0
                                const profit = Math.round(rawProfit * 100) / 100
                                const points = lot !== 0 ? Math.round(profit / lot) : 0

                                let exitPrice = trade.exit_price
                                if (!exitPrice && trade.entry_price) {
                                    const priceDiff = profit / (lot * 100)
                                    exitPrice = trade.type === 'BUY'
                                        ? trade.entry_price + priceDiff
                                        : trade.entry_price - priceDiff
                                }

                                let plannedRR: string | null = null
                                if (trade.stop_loss && trade.take_profit && trade.entry_price) {
                                    const risk = Math.abs(trade.entry_price - trade.stop_loss)
                                    const reward = Math.abs(trade.take_profit - trade.entry_price)
                                    if (risk > 0) plannedRR = (reward / risk).toFixed(1)
                                }

                                let actualRR: string | null = null
                                if (trade.stop_loss && trade.entry_price && exitPrice) {
                                    const risk = Math.abs(trade.entry_price - trade.stop_loss)
                                    const reward = Math.abs(exitPrice - trade.entry_price)
                                    if (risk > 0) {
                                        actualRR = (reward / risk).toFixed(2)
                                    }
                                }

                                const tradeDate = new Date(trade.created_at || Date.now())
                                const tradingDay = getTradingDay(trade.created_at || Date.now())
                                const dayOfWeek = tradingDay.getDay()
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
                                    <tr key={trade.id} className={cn("hover:bg-[#252525] transition-colors group border-b border-r border-b-[#252525] border-r-transparent last:border-b-0 text-sm", dayBorderColor)}>
                                        <td className="px-5 py-4 transition-all duration-300">
                                            <div>
                                                <div className="text-lg font-bold text-white tracking-wide whitespace-nowrap">{trade.symbol}</div>
                                                <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                                                    {tradeDate.toLocaleDateString()} • {tradeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                {trade.notes && (
                                                    <div className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                                                        <span className="text-gray-600 shrink-0">📝</span>
                                                        <span>{trade.notes}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                    {trade.strategy && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#ccf381]/10 border border-[#ccf381]/25 text-[#ccf381]">
                                                            #{trade.strategy}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className={cn(
                                                "text-xs font-black px-2.5 py-1.5 rounded inline-block min-w-[50px]",
                                                trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                                            )}>
                                                {trade.type}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="text-sm font-bold text-white">{trade.lot_size}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-bold text-white whitespace-nowrap">{trade.entry_price?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-bold text-gray-300 whitespace-nowrap">{exitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1 text-[11px] font-bold">
                                                {profit > 0 ? (
                                                    trade.take_profit && (
                                                        <span className="text-[#ccf381]/80 flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-[#ccf381]"></span>
                                                            {trade.take_profit?.toLocaleString()}
                                                        </span>
                                                    )
                                                ) : (
                                                    trade.stop_loss && (
                                                        <span className="text-red-400/80 flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                                            {trade.stop_loss?.toLocaleString()}
                                                        </span>
                                                    )
                                                )}
                                                {!trade.take_profit && profit > 0 && <span className="text-gray-600">—</span>}
                                                {!trade.stop_loss && profit <= 0 && <span className="text-gray-600">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {actualRR ? (
                                                <div className={cn(
                                                    "text-[11px] font-black px-2 py-1 rounded border inline-block",
                                                    Number(actualRR) >= 2 ? 'bg-[#ccf381]/10 border-[#ccf381]/20 text-[#ccf381]' :
                                                    Number(actualRR) >= 1 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/10 border-red-500/20 text-red-400'
                                                )}>
                                                    1:{actualRR}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div>
                                                <div className={cn(
                                                    "text-xl font-black tracking-tight",
                                                    Math.abs(Number(profit)) < 0.01 ? 'text-white' : Number(profit) > 0 ? 'text-[#ccf381] drop-shadow-[0_0_8px_rgba(204,243,129,0.4)]' : 'text-red-500'
                                                )}>
                                                    {Math.abs(Number(profit)) < 0.01 ? `$0` : Number(profit) > 0 ? `+$${Number(profit).toLocaleString()}` : `$${Number(profit).toLocaleString()}`}
                                                </div>
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    <span className={cn(
                                                        "text-[11px] font-bold",
                                                        Math.abs(Number(points)) < 0.01 ? 'text-gray-400' : Number(points) > 0 ? 'text-[#ccf381]/80' : 'text-red-400/70'
                                                    )}>
                                                        {Math.abs(Number(points)) < 0.01 ? '0 pts' : Number(points) > 0 ? `+${Number(points).toLocaleString()} pts` : `${Number(points).toLocaleString()} pts`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Trade Detail Column */}
                                        <td className="px-5 py-4 transition-all duration-300">
                                            <button
                                                onClick={() => setViewingTrade(trade)}
                                                className="flex items-center gap-2 group/detail"
                                            >
                                                {trade.screenshot_url ? (
                                                    <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 group-hover/detail:border-[#ccf381]/40 transition-colors relative">
                                                        <img src={trade.screenshot_url} alt="Chart" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/detail:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Eye size={12} className="text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-10 rounded-lg border border-white/10 group-hover/detail:border-[#ccf381]/40 transition-colors flex items-center justify-center bg-[#1a1a1a]">
                                                        <Eye size={14} className="text-gray-600 group-hover/detail:text-[#ccf381] transition-colors" />
                                                    </div>
                                                )}
                                                <span className="text-[10px] font-bold text-gray-500 group-hover/detail:text-[#ccf381] transition-colors uppercase tracking-wider">
                                                    View
                                                </span>
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-center transition-all duration-300">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setSharingTrade(trade)}
                                                    className="p-1.5 bg-[#1a2a10] hover:bg-[#2a3d1a] rounded-lg text-[#ccf381]/60 hover:text-[#ccf381] transition-all"
                                                    title="Share Trade Card"
                                                >
                                                    <Share2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingTrade(trade)}
                                                    className="p-1.5 bg-[#333] hover:bg-[#444] rounded-lg text-gray-400 hover:text-white transition-all"
                                                    title="Edit Trade"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(trade.id)}
                                                    disabled={deletingId === trade.id}
                                                    className={`p-1.5 rounded-lg transition-all ${deletingId === trade.id ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300'}`}
                                                    title="Delete Trade"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

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
                    const lot = t.lot_size || 0.01
                    const rawProfit = t.profit || 0
                    const p = Math.round(rawProfit * 100) / 100
                    const pts = lot !== 0 ? Math.round(p / lot) : 0
                    let ePrice = t.exit_price
                    if (!ePrice && t.entry_price) {
                        const priceDiff = p / (lot * 100)
                        ePrice = t.type === 'BUY' ? t.entry_price + priceDiff : t.entry_price - priceDiff
                    }
                    let rr: string | null = null
                    if (t.stop_loss && t.take_profit && t.entry_price) {
                        const risk = Math.abs(t.entry_price - t.stop_loss)
                        const reward = Math.abs(t.take_profit - t.entry_price)
                        if (risk > 0) rr = (reward / risk).toFixed(1)
                    }
                    const tDate = new Date(t.created_at || Date.now())

                    let actualRR: string | null = null
                    if (t.stop_loss && t.entry_price && ePrice) {
                        const risk = Math.abs(t.entry_price - t.stop_loss)
                        const reward = Math.abs(ePrice - t.entry_price)
                        if (risk > 0) {
                            actualRR = (reward / risk).toFixed(2)
                        }
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
                                            onClick={() => { setViewingTrade(null); setViewingScreenshot(t.screenshot_url) }}
                                        >
                                            <img src={t.screenshot_url} alt="Trade Chart" className="w-full h-auto max-h-[500px] object-contain" />
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
                                                {Math.abs(p) < 0.01 ? '$0' : p > 0 ? `+$${p.toLocaleString()}` : `$${p.toLocaleString()}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-sm font-black",
                                                Math.abs(pts) < 0.01 ? 'text-gray-500' : pts > 0 ? 'text-[#ccf381]/80' : 'text-red-400/80'
                                            )}>
                                                {pts > 0 ? '+' : ''}{pts.toLocaleString()} PTS
                                            </p>
                                            {rr && (
                                                <div className={cn("mt-1 text-[10px] font-black px-2 py-0.5 rounded-full border inline-block uppercase tracking-tighter",
                                                    Number(rr) >= 2 ? 'bg-[#ccf381]/10 border-[#ccf381]/20 text-[#ccf381]' :
                                                    Number(rr) >= 1 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/10 border-red-500/20 text-red-400'
                                                )}>
                                                    RR 1:{rr}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Information Grid (Compact) */}
                                    <div className={cn(
                                        "grid gap-2.5",
                                        t.screenshot_url ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                                    )}>
                                        <DetailItem icon={<Clock size={12} />} label="Timestamp" value={`${tDate.toLocaleDateString()} • ${tDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} />
                                        <DetailItem icon={t.type === 'BUY' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} label="Type" value={t.type} valueClass={t.type === 'BUY' ? 'text-green-400' : 'text-red-400'} />
                                        <DetailItem icon={<TrendingUp size={12} />} label="Volume" value={String(t.lot_size)} />
                                        <DetailItem icon={<BarChart3 size={12} />} label="Strategy" value={t.strategy} valueClass="text-[#ccf381]" />
                                        <DetailItem icon={<Target size={12} />} label="Entry" value={t.entry_price?.toLocaleString()} />
                                        <DetailItem icon={<Zap size={12} />} label="Exit" value={ePrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
                                        {p > 0 ? (
                                            <DetailItem icon={<Target size={12} />} label="Take Profit" value={t.take_profit?.toLocaleString()} valueClass="text-[#ccf381]/80" />
                                        ) : (
                                            <DetailItem icon={<Shield size={12} />} label="Stop Loss" value={t.stop_loss?.toLocaleString()} valueClass="text-red-400/80" />
                                        )}
                                        {actualRR && (
                                            <DetailItem icon={<Hash size={12} />} label="Actual RR" value={`1:${actualRR}`} valueClass={Number(actualRR) >= 1 ? "text-[#ccf381]" : "text-red-400"} />
                                        )}
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
                    dict={dict}
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
                        <img
                            src={viewingScreenshot}
                            alt="Trade Chart"
                            className="max-w-full max-h-full rounded-xl border border-white/10 shadow-2xl object-contain animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        />
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

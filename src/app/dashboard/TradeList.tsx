'use client'

import React from 'react'

import { useState } from 'react'
import { AIAnalysis } from './AIAnalysis'
import { Pencil, Share2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { EditTradeForm } from './EditTradeForm'
import { TradeShareModal } from './TradeShareModal'

export function TradeList({ trades, username }: { trades: any[], username?: string }) {
    const [editingTrade, setEditingTrade] = useState<any | null>(null)
    const [sharingTrade, setSharingTrade] = useState<any | null>(null)
    const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null)

    const isAnyExpanded = !!expandedAnalysisId
    const headPad = isAnyExpanded ? "px-3 py-3" : "px-5 py-3"
    const cellPad = isAnyExpanded ? "px-3 py-4" : "px-5 py-4"

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                <a href="/journal" className="text-sm text-[#ccf381] hover:underline">View Journal</a>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                {trades.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No trades yet.</div>
                ) : (
                    <table className="w-full text-left min-w-[700px] relative">
                        <thead className="bg-[#2a2a2a] text-gray-400 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-md">
                            <tr>
                                <th className={`${headPad} rounded-tl-xl transition-all duration-300`}>Asset</th>
                                <th className={`${headPad} transition-all duration-300`}>Side / Lot</th>
                                <th className={`${headPad} transition-all duration-300`}>Price</th>
                                <th className={`${headPad} transition-all duration-300`}>Result</th>
                                <th className={`${headPad} transition-all duration-300`}>Analysis</th>
                                <th className={`${headPad} text-center rounded-tr-xl w-12 transition-all duration-300`}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {trades.map((trade) => {
                                // Calculate Points & Exit if missing (Reverse Calc for display)
                                const lot = trade.lot_size || 0.01 // Fallback
                                const profit = trade.profit || 0
                                const points = lot !== 0 ? Math.round(profit / lot) : 0

                                // Exit Price Display (Use stored if avail, else calc)
                                let exitPrice = trade.exit_price
                                if (!exitPrice && trade.entry_price) {
                                    const priceDiff = profit / (lot * 100)
                                    exitPrice = trade.type === 'BUY'
                                        ? trade.entry_price + priceDiff
                                        : trade.entry_price - priceDiff
                                }

                                return (
                                    <tr key={trade.id} className="hover:bg-[#252525] transition-colors group border-b border-[#252525] last:border-0 text-sm">
                                        <td className={`${cellPad} transition-all duration-300`}>
                                            <div className="text-lg font-bold text-white tracking-wide whitespace-nowrap">{trade.symbol}</div>
                                            <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">{new Date(trade.created_at).toLocaleDateString()}</div>
                                            {trade.notes && (
                                                <div className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                                                    <span className="text-gray-600 shrink-0">📝</span>
                                                    <span>{trade.notes}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className={`${cellPad} transition-all duration-300`}>
                                            <div className={`text-sm font-black mb-1 px-2 py-0.5 rounded inline-block ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {trade.type}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium mt-1">Lot: <span className="text-white">{trade.lot_size}</span></div>
                                        </td>
                                        <td className={`${cellPad} text-sm font-mono text-gray-300 transition-all duration-300`}>
                                            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                                                <span className="text-gray-500 text-[10px] uppercase">En:</span>
                                                <span className="text-white font-bold">{trade.entry_price?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5 mt-1 whitespace-nowrap">
                                                <span className="text-gray-500 text-[10px] uppercase">Ex:</span>
                                                <span className="text-gray-300">{exitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                        <td className={`${cellPad} transition-all duration-300`}>
                                            <div className={`text-xl font-black tracking-tight whitespace-nowrap ${profit > 0 ? 'text-[#ccf381] drop-shadow-[0_0_5px_rgba(204,243,129,0.3)]' : 'text-red-500'}`}>
                                                {profit > 0 ? `+$${profit.toLocaleString()}` : `$${profit.toLocaleString()}`}
                                            </div>
                                            <div className={`text-xs font-bold mt-1 ${points > 0 ? 'text-[#ccf381]/70' : 'text-red-400/70'}`}>
                                                {points > 0 ? '+' : ''}{points.toLocaleString()} pts
                                            </div>
                                        </td>
                                        <td className={`${cellPad} relative transition-all duration-300`}>
                                            <AIAnalysis
                                                tradeId={trade.id}
                                                initialAnalysis={trade.ai_analysis}
                                                isExpanded={expandedAnalysisId === trade.id}
                                                onToggle={() => setExpandedAnalysisId(expandedAnalysisId === trade.id ? null : trade.id)}
                                            />
                                        </td>
                                        <td className={`${cellPad} text-center transition-all duration-300`}>
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

            {/* Modal for Sharing */}
            {sharingTrade && (
                <TradeShareModal
                    trade={sharingTrade}
                    username={username}
                    onClose={() => setSharingTrade(null)}
                />
            )}
        </>
    )
}

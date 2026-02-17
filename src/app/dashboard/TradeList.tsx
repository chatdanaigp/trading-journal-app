'use client'

import { useState } from 'react'
import { AIAnalysis } from './AIAnalysis'
import { Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { EditTradeForm } from './EditTradeForm'

export function TradeList({ trades }: { trades: any[] }) {
    const [editingTrade, setEditingTrade] = useState<any | null>(null)

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                <button className="text-sm text-[#ccf381] hover:underline">View All</button>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
                {trades.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No trades yet.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-[#2a2a2a] text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 rounded-tl-xl">Asset</th>
                                <th className="p-4">Side / Lot</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Result</th>
                                <th className="p-4">Analysis</th>
                                <th className="p-4 text-center rounded-tr-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {trades.slice(0, 5).map((trade) => {
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
                                        <td className="p-6">
                                            <div className="text-xl font-bold text-white tracking-wide">{trade.symbol}</div>
                                            <div className="text-sm text-gray-500 mt-1">{new Date(trade.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className={`text-lg font-black mb-1 px-3 py-1 rounded inline-block ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {trade.type}
                                            </div>
                                            <div className="text-sm text-gray-400 font-medium mt-1">Lot: <span className="text-white">{trade.lot_size}</span></div>
                                        </td>
                                        <td className="p-6 text-base font-mono text-gray-300">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-gray-500 text-xs uppercase">En:</span>
                                                <span className="text-white font-bold">{trade.entry_price?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-gray-500 text-xs uppercase">Ex:</span>
                                                <span className="text-gray-300">{exitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className={`text-2xl font-black tracking-tight ${profit > 0 ? 'text-[#ccf381] drop-shadow-[0_0_5px_rgba(204,243,129,0.3)]' : 'text-red-500'}`}>
                                                {profit > 0 ? `+$${profit.toLocaleString()}` : `$${profit.toLocaleString()}`}
                                            </div>
                                            <div className={`text-sm font-bold mt-1 ${points > 0 ? 'text-[#ccf381]/70' : 'text-red-400/70'}`}>
                                                {points > 0 ? '+' : ''}{points.toLocaleString()} pts
                                            </div>
                                        </td>
                                        <td className="p-6 w-1/3">
                                            <AIAnalysis tradeId={trade.id} initialAnalysis={trade.ai_analysis} />
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => setEditingTrade(trade)}
                                                className="p-2 bg-[#333] hover:bg-[#444] rounded-lg text-gray-400 hover:text-white transition-all"
                                                title="Edit Trade"
                                            >
                                                <Pencil size={18} />
                                            </button>
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
        </>
    )
}

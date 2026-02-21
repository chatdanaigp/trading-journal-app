'use client'

import { useState } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    getDay,
    addMonths,
    subMonths
} from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { getTradingDay } from '@/utils/date-helpers'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

// Local cn helper if not imported
function localCn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

type Trade = {
    id: string
    created_at: string
    profit: number | null
}

export function CalendarWidget({ trades, dict }: { trades: Trade[], dict?: any }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)

    // Get all days in the current month
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Calculate empty slots for proper alignment (Sunday start)
    const startDayConfig = getDay(monthStart) // 0 = Sunday
    const emptyDays = Array(startDayConfig).fill(null)

    // Navigate months
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    // Group trades by date and calculate daily PnL
    const getDayStats = (day: Date) => {
        const dailyTrades = trades.filter(trade =>
            isSameDay(getTradingDay(trade.created_at), day)
        )

        if (dailyTrades.length === 0) return null

        const dailyProfit = dailyTrades.reduce((sum, t) => sum + (t.profit || 0), 0)
        const winCount = dailyTrades.filter(t => (t.profit || 0) >= 0).length
        const lossCount = dailyTrades.filter(t => (t.profit || 0) < 0).length
        const tradeCount = dailyTrades.length

        return { dailyProfit, winCount, lossCount, tradeCount, dailyTrades }
    }

    const selectedDayStats = selectedDay ? getDayStats(selectedDay) : null;

    return (
        <Card className="relative border-0 shadow-lg col-span-1 overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] z-0" />
            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="text-white">{dict?.dashboard?.tradingCalendar || 'Trading Calendar'}</CardTitle>
                <div className="flex items-center space-x-2 bg-[#252525] rounded-lg p-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors">←</button>
                    <span className="text-sm font-bold text-gray-200 w-24 text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors">→</button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Days Header */}
                <div className="grid grid-cols-7 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-[10px] uppercase text-gray-600 font-bold py-1 tracking-wider">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 relative z-10">
                    {/* Empty cells for offset */}
                    {emptyDays.map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[80px] bg-transparent" />
                    ))}

                    {/* Days */}
                    {daysInMonth.map((day) => {
                        const stats = getDayStats(day)
                        let bgColor = "bg-[#252525]/30 border border-white/5 hover:bg-[#2a2a2a]"
                        let textColor = "text-gray-500"
                        let profitColor = ""

                        if (stats) {
                            if (stats.dailyProfit > 0) {
                                bgColor = "bg-gradient-to-br from-[#ccf381]/20 to-[#ccf381]/5 border border-[#ccf381]/30 hover:shadow-[0_0_15px_rgba(204,243,129,0.1)]"
                                profitColor = "text-[#ccf381]"
                            } else if (stats.dailyProfit < 0) {
                                bgColor = "bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                profitColor = "text-red-400"
                            } else {
                                bgColor = "bg-[#252525] border border-white/10"
                                profitColor = "text-gray-400"
                            }
                        }

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => { if (stats) setSelectedDay(day) }}
                                className={cn(
                                    "min-h-[60px] rounded-lg flex flex-col items-start justify-between p-2 relative group transition-all duration-300 backdrop-blur-sm",
                                    stats ? "cursor-pointer" : "cursor-default",
                                    bgColor,
                                    selectedDay && isSameDay(day, selectedDay) && "ring-2 ring-white/50"
                                )}
                            >
                                <span className={cn("text-xs font-medium w-full text-right mb-1 transition-colors", stats ? "text-gray-200" : "text-gray-600 group-hover:text-gray-400")}>
                                    {format(day, 'd')}
                                </span>

                                {stats && (
                                    <div className="flex flex-col w-full">
                                        <span className={cn("text-[10px] font-bold leading-tight", profitColor)}>
                                            {stats.dailyProfit > 0 ? '+' : ''}{stats.dailyProfit}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end items-center mt-4 gap-3 text-[10px] text-gray-500 relative z-10">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#ccf381] shadow-[0_0_5px_#ccf381]"></div>
                        <span>{dict?.tradeForm?.profitBtn || 'Profit'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>
                        <span>{dict?.tradeForm?.lossBtn || 'Loss'}</span>
                    </div>
                </div>

                {/* --- DAILY STATS MODAL --- */}
                <AnimatePresence>
                    {selectedDay && selectedDayStats && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={(e) => { if (e.target === e.currentTarget) setSelectedDay(null) }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="w-full max-w-2xl bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden"
                            >
                                {/* Modal Header */}
                                <div className="flex justify-between items-center p-6 border-b border-[#222]">
                                    <div>
                                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                            <span>📅</span> {format(selectedDay, 'dd MMMM yyyy')}
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">{dict?.dashboard?.tradingSession || 'Trading session:'} {format(selectedDay, 'dd MMM')} 06:00 - {format(addMonths(selectedDay, 0), 'dd') === format(selectedDay, 'dd') ? format(selectedDay, 'dd') : format(addMonths(selectedDay, 0), 'dd')} 05:59</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="p-2 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-xl transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#222]">
                                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">{dict?.dashboard?.netPnl || 'Net P&L'}</p>
                                            <p className={cn("text-2xl font-black", selectedDayStats.dailyProfit >= 0 ? "text-[#ccf381]" : "text-red-400")}>
                                                {selectedDayStats.dailyProfit >= 0 ? '+' : ''}${selectedDayStats.dailyProfit.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#222]">
                                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">{dict?.dashboard?.totalTrades || 'Total Trades'}</p>
                                            <p className="text-2xl font-black text-white">{selectedDayStats.tradeCount}</p>
                                        </div>
                                        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#222]">
                                            <p className="text-gray-500 text-xs font-bold uppercase mb-1">{dict?.dashboard?.winRate || 'Win Rate'}</p>
                                            <p className="text-2xl font-black text-blue-400">
                                                {Math.round((selectedDayStats.winCount / selectedDayStats.tradeCount) * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Trade List */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-[#222] pb-2">{dict?.dashboard?.tradeHistory || 'Trade History'}</h3>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedDayStats.dailyTrades.map((trade: any) => (
                                                <div key={trade.id} className="flex justify-between items-center p-3 bg-[#1a1a1a] hover:bg-[#222] transition-colors rounded-xl border border-[#222]">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("px-2 py-1 rounded text-xs font-bold", trade.type === 'BUY' ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-500")}>
                                                            {trade.type}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-200">{trade.symbol}</p>
                                                            <p className="text-xs text-gray-500">{format(new Date(trade.created_at), 'HH:mm')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={cn("font-bold text-sm", (trade.profit || 0) >= 0 ? "text-[#ccf381]" : "text-red-400")}>
                                                            {(trade.profit || 0) >= 0 ? '+' : ''}${(trade.profit || 0).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{trade.lot_size} {dict?.dashboard?.lots || 'Lots'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </CardContent>
        </Card>
    )
}

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

// Local cn helper if not imported
function localCn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

type Trade = {
    id: string
    created_at: string
    profit: number | null
}

export function CalendarWidget({ trades }: { trades: Trade[] }) {
    const [currentDate, setCurrentDate] = useState(new Date())

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
            isSameDay(new Date(trade.created_at), day)
        )

        if (dailyTrades.length === 0) return null

        const dailyProfit = dailyTrades.reduce((sum, t) => sum + (t.profit || 0), 0)
        const winCount = dailyTrades.filter(t => (t.profit || 0) >= 0).length
        const lossCount = dailyTrades.filter(t => (t.profit || 0) < 0).length
        const tradeCount = dailyTrades.length

        return { dailyProfit, winCount, lossCount, tradeCount }
    }

    return (
        <Card className="relative border-0 shadow-lg col-span-1 overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] z-0" />
            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="text-white">Trading Calendar</CardTitle>
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
                                className={cn(
                                    "min-h-[60px] rounded-lg flex flex-col items-start justify-between p-2 relative group cursor-default transition-all duration-300 backdrop-blur-sm",
                                    bgColor
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
                        <span>Profit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>
                        <span>Loss</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

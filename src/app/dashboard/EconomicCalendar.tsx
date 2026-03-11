'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'

const IMPACT_STYLES: Record<string, { dot: string, text: string }> = {
    high: { dot: 'bg-red-500', text: 'text-red-400' },
    medium: { dot: 'bg-amber-500', text: 'text-amber-400' },
    low: { dot: 'bg-green-500', text: 'text-green-400' }
}

export function EconomicCalendar({ dict }: { dict?: any }) {
    const [data, setData] = useState<any>(null)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        fetch('/api/calendar')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => {})
    }, [])

    if (!data || !data.events?.length) return null

    const todayEvents = data.events.filter((e: any) => e.isToday)
    const upcomingEvents = data.events.filter((e: any) => !e.isToday)

    return (
        <Card className="relative border-0 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20 group-hover:border-amber-500/20 transition-colors duration-300" />

            <CardHeader className="relative z-10 pb-2 px-4 pt-4">
                <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                            <Calendar className="w-3 h-3 text-amber-400" />
                        </div>
                        {dict?.calendar?.title || 'Economic Calendar'}
                        {todayEvents.length > 0 && (
                            <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-md border border-red-500/25 animate-pulse">
                                {todayEvents.length} today
                            </span>
                        )}
                    </CardTitle>
                    {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
                </button>
            </CardHeader>

            {expanded && (
                <CardContent className="relative z-10 px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                        {/* Today's events */}
                        {todayEvents.length > 0 && (
                            <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider pb-1">
                                📅 Today
                            </div>
                        )}
                        {todayEvents.map((evt: any, i: number) => (
                            <EventRow key={`today-${i}`} event={evt} />
                        ))}

                        {/* Upcoming */}
                        {upcomingEvents.length > 0 && (
                            <div className="text-[9px] text-gray-600 font-bold uppercase tracking-wider pt-2 pb-1">
                                Upcoming
                            </div>
                        )}
                        {upcomingEvents.slice(0, 5).map((evt: any, i: number) => (
                            <EventRow key={`up-${i}`} event={evt} />
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

function EventRow({ event }: { event: any }) {
    const style = IMPACT_STYLES[event.impact] || IMPACT_STYLES.low

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-colors">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white truncate">{event.title}</p>
                <p className="text-[9px] text-gray-600">{event.time}</p>
            </div>
            <span className="text-[9px] font-black text-gray-500 shrink-0">{event.currency}</span>
        </div>
    )
}

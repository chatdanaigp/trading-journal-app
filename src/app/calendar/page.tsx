'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, AlertTriangle, TrendingUp, Clock, ArrowLeft } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { TopNavigation } from '@/components/TopNavigation'
import { PageSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'

const IMPACT_STYLES: Record<string, { dot: string, bg: string, text: string, label: string }> = {
    high: { dot: 'bg-red-500', bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', label: '🔴 High Impact' },
    medium: { dot: 'bg-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: '🟡 Medium Impact' },
    low: { dot: 'bg-green-500', bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', label: '🟢 Low Impact' }
}

function useLang() {
    const [dict, setDict] = useState<any>(null)
    useEffect(() => {
        const lang = (document.cookie.match(/tj_language=(\w+)/)?.[1] || 'EN') as 'EN' | 'TH'
        import('@/utils/dictionaries').then(mod => setDict(mod.dictionaries[lang]))
    }, [])
    return dict
}

export default function CalendarPage() {
    const dict = useLang()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/calendar')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    if (!dict || loading) return <PageSkeleton />

    const todayEvents = data?.events?.filter((e: any) => e.isToday) || []
    const upcomingEvents = data?.events?.filter((e: any) => !e.isToday) || []
    const highImpactToday = todayEvents.filter((e: any) => e.impact === 'high')

    // Daily Summary
    const currencies = [...new Set(todayEvents.map((e: any) => e.currency))] as string[]

    return (
        <div className="space-y-8">
            <TopNavigation />

            <StaggerContainer className="space-y-6">
                {/* Header */}
                <StaggerItem>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                <Calendar className="w-8 h-8 text-amber-400" />
                                {dict?.calendar?.title || 'Economic Calendar'}
                            </h1>
                            <p className="text-gray-500 mt-1">{dict?.calendar?.subtitle || 'Track high-impact economic events that move the markets'}</p>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400 font-bold">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </StaggerItem>

                {/* Daily Summary Card */}
                <StaggerItem>
                    <Card className="relative border-0 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-amber-500/10 rounded-xl pointer-events-none z-20" />
                        <CardHeader className="relative z-10 border-b border-white/5 pb-3">
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <TrendingUp className="w-5 h-5 text-amber-400" />
                                {dict?.calendar?.dailySummary || "📋 Today's Summary"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4 space-y-4">
                            {todayEvents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                                    <p className="font-bold">{dict?.calendar?.noEvents || 'No major events today'}</p>
                                    <p className="text-xs text-gray-700 mt-1">{dict?.calendar?.noEventsSub || 'Good day for technical-based trading'}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-[#0d0d0d] rounded-xl p-3 border border-white/5 text-center">
                                            <p className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">{dict?.calendar?.totalEvents || 'Total Events'}</p>
                                            <p className="text-2xl font-black text-white">{todayEvents.length}</p>
                                        </div>
                                        <div className="bg-[#0d0d0d] rounded-xl p-3 border border-red-500/10 text-center">
                                            <p className="text-[9px] text-red-400 uppercase font-bold tracking-wider">{dict?.calendar?.highImpact || 'High Impact'}</p>
                                            <p className="text-2xl font-black text-red-400">{highImpactToday.length}</p>
                                        </div>
                                        <div className="bg-[#0d0d0d] rounded-xl p-3 border border-white/5 text-center">
                                            <p className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">{dict?.calendar?.currencies || 'Currencies'}</p>
                                            <p className="text-lg font-black text-white">{currencies.join(', ') || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Warning if high impact */}
                                    {highImpactToday.length > 0 && (
                                        <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-red-400">{dict?.calendar?.warning || '⚠️ High Impact Events Today'}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {dict?.calendar?.warningDesc || 'Be cautious around event times. Consider reducing position sizes or waiting for volatility to settle.'}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {highImpactToday.map((e: any, i: number) => (
                                                        <span key={i} className="text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-1 rounded-lg border border-red-500/20">
                                                            {e.time} — {e.title} ({e.currency})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </StaggerItem>

                {/* Today's Events Detail */}
                {todayEvents.length > 0 && (
                    <StaggerItem>
                        <Card className="relative border-0 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                            <CardHeader className="relative z-10 border-b border-white/5 pb-3">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <span className="w-1 h-6 bg-amber-500 rounded-full inline-block" />
                                    {dict?.calendar?.todayTitle || "📅 Today's Events"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10 pt-4 space-y-2">
                                {todayEvents.map((evt: any, i: number) => (
                                    <EventCard key={i} event={evt} />
                                ))}
                            </CardContent>
                        </Card>
                    </StaggerItem>
                )}

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <StaggerItem>
                        <Card className="relative border-0 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                            <CardHeader className="relative z-10 border-b border-white/5 pb-3">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
                                    {dict?.calendar?.upcomingTitle || '📆 Upcoming Events'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10 pt-4 space-y-2">
                                {upcomingEvents.map((evt: any, i: number) => (
                                    <EventCard key={i} event={evt} />
                                ))}
                            </CardContent>
                        </Card>
                    </StaggerItem>
                )}
            </StaggerContainer>
        </div>
    )
}

function EventCard({ event }: { event: any }) {
    const style = IMPACT_STYLES[event.impact] || IMPACT_STYLES.low

    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl bg-[#0d0d0d] border border-white/5 hover:border-white/10 transition-all group`}>
            {/* Impact dot */}
            <div className={`w-3 h-3 rounded-full shrink-0 ${style.dot} shadow-lg`} style={{ boxShadow: `0 0 8px ${style.dot === 'bg-red-500' ? 'rgba(239,68,68,0.3)' : style.dot === 'bg-amber-500' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.2)'}` }} />

            {/* Time */}
            <div className="shrink-0 w-16">
                <div className="flex items-center gap-1">
                    <Clock size={10} className="text-gray-600" />
                    <span className="text-xs font-bold text-gray-400">{event.time.replace(' UTC', '')}</span>
                </div>
                <span className="text-[9px] text-gray-700">UTC</span>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-[#ccf381] transition-colors">{event.title}</p>
                <span className={`text-[9px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded border ${style.bg} ${style.text}`}>{style.label}</span>
            </div>

            {/* Currency */}
            <div className="shrink-0">
                <span className="text-sm font-black text-gray-400 bg-[#1a1a1a] px-2.5 py-1 rounded-lg border border-white/5">{event.currency}</span>
            </div>
        </div>
    )
}

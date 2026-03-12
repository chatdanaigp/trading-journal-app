'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertTriangle, TrendingUp, Clock, Zap, Shield } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { TopNavigation } from '@/components/TopNavigation'

const IMPACT_CONFIG: Record<string, { dot: string; glow: string; badge: string; badgeText: string; label: string }> = {
    high:   { dot: 'bg-red-500',    glow: 'rgba(239,68,68,0.25)',   badge: 'bg-red-500/15 border-red-500/30',    badgeText: 'text-red-400',    label: '🔴 High' },
    medium: { dot: 'bg-amber-400',  glow: 'rgba(251,191,36,0.2)',   badge: 'bg-amber-500/15 border-amber-500/30', badgeText: 'text-amber-400',  label: '🟡 Medium' },
    low:    { dot: 'bg-emerald-500', glow: 'rgba(16,185,129,0.15)', badge: 'bg-emerald-500/10 border-emerald-500/20', badgeText: 'text-emerald-400', label: '🟢 Low' },
}

export default function CalendarPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/calendar')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => setData({ events: [] }))
            .finally(() => setLoading(false))
    }, [])

    const todayEvents: any[] = data?.events?.filter((e: any) => e.isToday) || []
    const upcomingEvents: any[] = data?.events?.filter((e: any) => !e.isToday) || []
    const highImpactToday = todayEvents.filter((e: any) => e.impact === 'high')
    const currencies = [...new Set(todayEvents.map((e: any) => e.currency))] as string[]

    return (
        <div className="space-y-6">
            <TopNavigation />

            <StaggerContainer className="space-y-6">

                {/* Page Header */}
                <StaggerItem>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-5 border-b border-[#1a1a1a]">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-amber-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Economic Calendar</h1>
                            </div>
                            <p className="text-gray-500 text-sm ml-[52px]">Track high-impact events that move the markets</p>
                        </div>
                        <div className="bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-sm text-gray-400 font-bold whitespace-nowrap">
                            📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </StaggerItem>

                {/* Daily Summary */}
                <StaggerItem>
                    <div className="relative rounded-2xl overflow-hidden border border-amber-500/10 bg-gradient-to-br from-amber-950/20 via-[#0a0a0a] to-[#050505]">
                        <div className="absolute inset-0 opacity-30 pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse at top left, rgba(245,158,11,0.08), transparent 60%)' }} />

                        <div className="relative p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <TrendingUp className="w-4 h-4 text-amber-400" />
                                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Today's Summary</h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-3 gap-3 animate-pulse">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5" />)}
                                </div>
                            ) : todayEvents.length === 0 ? (
                                <div className="text-center py-8">
                                    <Shield className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
                                    <p className="font-bold text-gray-400">No major events today</p>
                                    <p className="text-xs text-gray-600 mt-1">✅ Safe for technical trading today</p>
                                </div>
                            ) : (
                                <>
                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5 text-center">
                                            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">Total Events</p>
                                            <p className="text-3xl font-black text-white">{todayEvents.length}</p>
                                        </div>
                                        <div className="bg-[#0d0d0d] rounded-xl p-4 border border-red-500/15 text-center">
                                            <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest mb-1">⚠️ High Impact</p>
                                            <p className={`text-3xl font-black ${highImpactToday.length > 0 ? 'text-red-400' : 'text-gray-600'}`}>{highImpactToday.length}</p>
                                        </div>
                                        <div className="bg-[#0d0d0d] rounded-xl p-4 border border-white/5 text-center">
                                            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">Currencies</p>
                                            <p className="text-sm font-black text-white leading-tight mt-1">{currencies.join(', ') || '—'}</p>
                                        </div>
                                    </div>

                                    {/* High impact warning */}
                                    {highImpactToday.length > 0 && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-red-400 mb-1">⚠️ High Impact Events Today</p>
                                                <p className="text-xs text-gray-500 mb-2">Be cautious around these times. Consider reducing lot size or waiting for volatility to settle.</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {highImpactToday.map((e: any, i: number) => (
                                                        <span key={i} className="flex items-center gap-1.5 text-[11px] font-bold bg-red-500/10 text-red-400 px-2.5 py-1 rounded-lg border border-red-500/20">
                                                            <Clock size={10} />
                                                            {e.time.replace(' UTC', '')} — {e.title} <span className="text-red-600">({e.currency})</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </StaggerItem>

                {/* Today's Events */}
                {!loading && todayEvents.length > 0 && (
                    <StaggerItem>
                        <div className="rounded-2xl border border-white/5 bg-[#080808] overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                                <h2 className="font-bold text-white">📅 Today's Events</h2>
                                <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{todayEvents.length}</span>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {todayEvents.map((evt: any, i: number) => (
                                    <EventRow key={i} event={evt} />
                                ))}
                            </div>
                        </div>
                    </StaggerItem>
                )}

                {/* Upcoming Events */}
                {!loading && upcomingEvents.length > 0 && (
                    <StaggerItem>
                        <div className="rounded-2xl border border-white/5 bg-[#080808] overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                                <h2 className="font-bold text-white">📆 Upcoming Events</h2>
                                <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{upcomingEvents.length}</span>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {upcomingEvents.map((evt: any, i: number) => (
                                    <EventRow key={i} event={evt} />
                                ))}
                            </div>
                        </div>
                    </StaggerItem>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <StaggerItem>
                        <div className="rounded-2xl border border-white/5 bg-[#080808] overflow-hidden animate-pulse">
                            <div className="px-5 py-4 border-b border-white/5">
                                <div className="h-5 w-32 bg-white/5 rounded" />
                            </div>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04]">
                                    <div className="w-3 h-3 rounded-full bg-white/10" />
                                    <div className="w-14 h-4 bg-white/5 rounded" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-4 w-48 bg-white/5 rounded" />
                                        <div className="h-3 w-20 bg-white/5 rounded" />
                                    </div>
                                    <div className="w-10 h-6 bg-white/5 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </StaggerItem>
                )}
            </StaggerContainer>
        </div>
    )
}

function EventRow({ event }: { event: any }) {
    const cfg = IMPACT_CONFIG[event.impact] || IMPACT_CONFIG.low

    return (
        <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
            {/* Impact dot */}
            <div
                className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`}
                style={{ boxShadow: `0 0 8px ${cfg.glow}` }}
            />

            {/* Time */}
            <div className="shrink-0 w-14 text-right">
                <p className="text-xs font-bold text-gray-300">{event.time.replace(' UTC', '')}</p>
                <p className="text-[9px] text-gray-700">UTC</p>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/5 shrink-0" />

            {/* Title + badge */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-[#ccf381] transition-colors truncate">{event.title}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border mt-0.5 ${cfg.badge} ${cfg.badgeText}`}>
                    <Zap size={9} />
                    {cfg.label} Impact
                </span>
            </div>

            {/* Currency */}
            <div className="shrink-0">
                <span className="text-xs font-black text-gray-400 bg-[#111] px-2.5 py-1.5 rounded-lg border border-white/5">{event.currency}</span>
            </div>
        </div>
    )
}

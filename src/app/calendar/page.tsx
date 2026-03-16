'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertTriangle, TrendingUp, Clock, Zap, Shield, ChevronDown, ChevronUp, Globe, BarChart3, RefreshCw } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { TopNavigation } from '@/components/TopNavigation'

const IMPACT_CONFIG: Record<string, { dot: string; glow: string; badge: string; badgeText: string; label: string }> = {
    high:   { dot: 'bg-red-500',    glow: 'rgba(239,68,68,0.25)',   badge: 'bg-red-500/15 border-red-500/30',    badgeText: 'text-red-400',    label: '🔴 High' },
    medium: { dot: 'bg-amber-400',  glow: 'rgba(251,191,36,0.2)',   badge: 'bg-amber-500/15 border-amber-500/30', badgeText: 'text-amber-400',  label: '🟡 Medium' },
    low:    { dot: 'bg-emerald-500', glow: 'rgba(16,185,129,0.15)', badge: 'bg-emerald-500/10 border-emerald-500/20', badgeText: 'text-emerald-400', label: '🟢 Low' },
}

const FILTER_OPTIONS = ['all', 'high', 'medium', 'low'] as const
const ALL_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'CNY'] as const

export default function CalendarPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(new Set(ALL_CURRENCIES))
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    const toggleCurrency = (currency: string) => {
        setSelectedCurrencies(prev => {
            const next = new Set(prev)
            if (next.has(currency)) {
                next.delete(currency)
            } else {
                next.add(currency)
            }
            return next
        })
    }

    const selectAllCurrencies = () => setSelectedCurrencies(new Set(ALL_CURRENCIES))
    const clearAllCurrencies = () => setSelectedCurrencies(new Set())

    const fetchData = (showLoading = true) => {
        if (showLoading) setLoading(true)
        else setRefreshing(true)
        fetch('/api/calendar')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => setData({ events: [] }))
            .finally(() => { setLoading(false); setRefreshing(false) })
    }

    useEffect(() => { fetchData() }, [])

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => fetchData(false), 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const allEvents: any[] = data?.events || []
    const currencyFiltered = allEvents.filter((e: any) => selectedCurrencies.has(e.currency))
    const filteredEvents = filter === 'all' ? currencyFiltered : currencyFiltered.filter((e: any) => e.impact === filter)
    const todayEvents = filteredEvents.filter((e: any) => e.isToday)
    const upcomingEvents = filteredEvents.filter((e: any) => !e.isToday)

    // Group upcoming by date
    const upcomingByDate: Record<string, any[]> = {}
    upcomingEvents.forEach((evt: any) => {
        if (!upcomingByDate[evt.date]) upcomingByDate[evt.date] = []
        upcomingByDate[evt.date].push(evt)
    })

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
                            <p className="text-gray-500 text-sm ml-[52px]">ข่าวเศรษฐกิจ Real-time • เวลาประเทศไทย (GMT+7)</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchData(false)}
                                disabled={refreshing}
                                className="flex items-center gap-1.5 bg-[#111] border border-[#222] rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-[#ccf381] hover:border-[#ccf381]/30 transition-all"
                            >
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <div className="bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-sm text-gray-400 font-bold whitespace-nowrap flex items-center gap-2">
                                <Globe size={14} />
                                📅 {new Date().toLocaleDateString('th-TH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Bangkok' })}
                            </div>
                        </div>
                    </div>
                </StaggerItem>

                {/* Impact Filter */}
                <StaggerItem>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-600 font-bold uppercase mr-1">Impact:</span>
                            {FILTER_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setFilter(opt)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                        filter === opt
                                            ? opt === 'all' ? 'bg-white/10 border-white/20 text-white'
                                            : opt === 'high' ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                            : opt === 'medium' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-[#111] border-[#222] text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {opt === 'all' ? '📋 All' : opt === 'high' ? '🔴 High' : opt === 'medium' ? '🟡 Medium' : '🟢 Low'}
                            </button>
                            ))}
                            <span className="text-[10px] text-gray-600 ml-2">
                                ({filteredEvents.length} events)
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-600 font-bold uppercase mr-1">Currency:</span>
                            <button
                                onClick={selectAllCurrencies}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                                    selectedCurrencies.size === ALL_CURRENCIES.length
                                        ? 'bg-white/10 border-white/20 text-white'
                                        : 'bg-[#111] border-[#222] text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={clearAllCurrencies}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                                    selectedCurrencies.size === 0
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : 'bg-[#111] border-[#222] text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                Clear
                            </button>
                            {ALL_CURRENCIES.map(cur => (
                                <button
                                    key={cur}
                                    onClick={() => toggleCurrency(cur)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${
                                        selectedCurrencies.has(cur)
                                            ? 'bg-[#ccf381]/10 border-[#ccf381]/30 text-[#ccf381]'
                                            : 'bg-[#111] border-[#222] text-gray-600 hover:text-gray-400'
                                    }`}
                                >
                                    {cur}
                                </button>
                            ))}
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
                                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">สรุปวันนี้ (Today's Summary)</h2>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-3 gap-3 animate-pulse">
                                    {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5" />)}
                                </div>
                            ) : todayEvents.length === 0 ? (
                                <div className="text-center py-8">
                                    <Shield className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
                                    <p className="font-bold text-gray-400">ไม่มีข่าวสำคัญวันนี้</p>
                                    <p className="text-xs text-gray-600 mt-1">✅ ปลอดภัยสำหรับการเทรดตาม Technical</p>
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
                                            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-1">สกุลเงินที่เกี่ยวข้อง</p>
                                            <p className="text-sm font-black text-white leading-tight mt-1">{currencies.join(', ') || '—'}</p>
                                        </div>
                                    </div>

                                    {/* High impact warning */}
                                    {highImpactToday.length > 0 && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-red-400 mb-1">⚠️ มีข่าวสำคัญวันนี้!</p>
                                                <p className="text-xs text-gray-500 mb-2">ควรระวังช่วงเวลาประกาศข่าว ลดขนาด Lot หรือรอให้ความผันผวนสงบก่อนเทรด</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {highImpactToday.map((e: any, i: number) => (
                                                        <span key={i} className="flex items-center gap-1.5 text-[11px] font-bold bg-red-500/10 text-red-400 px-2.5 py-1 rounded-lg border border-red-500/20">
                                                            <Clock size={10} />
                                                            {e.time} — {e.title} <span className="text-red-600">({e.currency})</span>
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
                                <h2 className="font-bold text-white">📅 ข่าววันนี้ (Today)</h2>
                                <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{todayEvents.length}</span>
                            </div>
                            <div className="divide-y divide-white/[0.04]">
                                {todayEvents.map((evt: any, i: number) => (
                                    <EventRow key={`today-${i}`} event={evt} index={i} expandedEvent={expandedEvent} setExpandedEvent={setExpandedEvent} />
                                ))}
                            </div>
                        </div>
                    </StaggerItem>
                )}

                {/* Upcoming Events - grouped by date */}
                {!loading && Object.keys(upcomingByDate).length > 0 && Object.entries(upcomingByDate).map(([date, events]) => {
                    const dateObj = new Date(date + 'T00:00:00')
                    const dateLabel = dateObj.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Bangkok' })
                    const baseIndex = allEvents.findIndex(e => e.date === date && !e.isToday)

                    return (
                        <StaggerItem key={date}>
                            <div className="rounded-2xl border border-white/5 bg-[#080808] overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                                    <span className="w-1 h-5 bg-blue-500 rounded-full" />
                                    <h2 className="font-bold text-white">📆 {dateLabel}</h2>
                                    <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{events.length}</span>
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                    {events.map((evt: any, i: number) => (
                                        <EventRow key={`${date}-${i}`} event={evt} index={baseIndex + i + 1000} expandedEvent={expandedEvent} setExpandedEvent={setExpandedEvent} />
                                    ))}
                                </div>
                            </div>
                        </StaggerItem>
                    )
                })}

                {/* Loading skeleton */}
                {loading && (
                    <StaggerItem>
                        <div className="rounded-2xl border border-white/5 bg-[#080808] overflow-hidden animate-pulse">
                            <div className="px-5 py-4 border-b border-white/5">
                                <div className="h-5 w-32 bg-white/5 rounded" />
                            </div>
                            {[...Array(5)].map((_, i) => (
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

                {/* Empty state */}
                {!loading && filteredEvents.length === 0 && (
                    <StaggerItem>
                        <div className="text-center py-16">
                            <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">ไม่พบข่าวที่ตรงกับตัวกรอง</p>
                            <p className="text-xs text-gray-600 mt-1">ลองเปลี่ยนตัวกรองหรือรอข้อมูลอัปเดตใหม่</p>
                        </div>
                    </StaggerItem>
                )}
            </StaggerContainer>
        </div>
    )
}

function EventRow({ event, index, expandedEvent, setExpandedEvent }: { event: any, index: number, expandedEvent: number | null, setExpandedEvent: (i: number | null) => void }) {
    const cfg = IMPACT_CONFIG[event.impact] || IMPACT_CONFIG.low
    const isExpanded = expandedEvent === index

    return (
        <div className="group">
            <div
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => setExpandedEvent(isExpanded ? null : index)}
            >
                {/* Impact dot */}
                <div
                    className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`}
                    style={{ boxShadow: `0 0 8px ${cfg.glow}` }}
                />

                {/* Time */}
                <div className="shrink-0 w-14 text-right">
                    <p className="text-xs font-bold text-gray-300">{event.time}</p>
                    <p className="text-[9px] text-gray-700">GMT+7</p>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/5 shrink-0" />

                {/* Title + badge */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-[#ccf381] transition-colors truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.badge} ${cfg.badgeText}`}>
                            <Zap size={9} />
                            {cfg.label} Impact
                        </span>
                        {event.forecast && (
                            <span className="text-[10px] text-gray-500">
                                คาด: <span className="text-gray-300 font-bold">{event.forecast}</span>
                            </span>
                        )}
                        {event.previous && (
                            <span className="text-[10px] text-gray-500">
                                ก่อนหน้า: <span className="text-gray-400">{event.previous}</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Currency + expand */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-gray-400 bg-[#111] px-2.5 py-1.5 rounded-lg border border-white/5">{event.currency}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-600" />}
                </div>
            </div>

            {/* Expanded Analysis */}
            {isExpanded && event.analysis && (
                <div className="px-5 pb-4">
                    <div className="ml-[calc(12px+16px+56px+16px+1px+16px)] bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-[#ccf381] uppercase tracking-wider">📊 วิเคราะห์</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{event.analysis}</p>
                        {(event.forecast || event.previous) && (
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                                {event.forecast && (
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase">คาดการณ์</p>
                                        <p className="text-sm font-bold text-amber-400">{event.forecast}</p>
                                    </div>
                                )}
                                {event.previous && (
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase">ครั้งก่อน</p>
                                        <p className="text-sm font-bold text-gray-400">{event.previous}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

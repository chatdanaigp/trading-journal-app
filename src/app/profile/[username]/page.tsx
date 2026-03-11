'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Target, Flame, TrendingUp, BarChart3, Shield } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function PublicProfilePage() {
    const params = useParams()
    const username = params.username as string
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/public-profile?username=${username}`)
            .then(r => r.json())
            .then(d => {
                if (d.error) setError(d.error)
                else setData(d)
            })
            .catch(() => setError('Failed to load profile'))
            .finally(() => setLoading(false))
    }, [username])

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#ccf381] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-400">
            <div className="text-center space-y-4">
                <Shield className="w-16 h-16 mx-auto text-gray-700" />
                <h1 className="text-2xl font-bold text-white">{error === 'Profile is private' ? 'Private Profile' : 'Profile Not Found'}</h1>
                <p className="text-gray-600">{error === 'Profile is private' ? 'This trader has their profile set to private.' : 'This trader profile does not exist.'}</p>
            </div>
        </div>
    )

    const { profile, stats, equityCurve, strategies } = data

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
                {/* Profile Header */}
                <div className="text-center space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#ccf381] to-[#bbe075] flex items-center justify-center text-3xl font-black text-black">
                        {profile.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">@{profile.username}</h1>
                    {profile.bio && <p className="text-gray-400 max-w-md mx-auto">{profile.bio}</p>}
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#ccf381]">
                        <Shield size={12} />
                        Verified Trader Profile
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard icon={<BarChart3 className="w-5 h-5" />} label="Total Trades" value={stats.totalTrades} color="blue" />
                    <StatsCard icon={<Target className="w-5 h-5" />} label="Win Rate" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? 'green' : 'red'} />
                    <StatsCard icon={<TrendingUp className="w-5 h-5" />} label="Profit Factor" value={stats.profitFactor.toFixed(2)} color={stats.profitFactor >= 1.5 ? 'green' : 'amber'} />
                    <StatsCard icon={<Flame className="w-5 h-5" />} label="Best Streak" value={`${stats.maxWinStreak} W`} color="green" />
                </div>

                {/* Equity Curve (% based) */}
                {equityCurve.length > 1 && (
                    <Card className="relative border-0 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#ccf381] rounded-full inline-block" />
                                Performance Curve
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 h-[300px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={equityCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPublic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ccf381" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#ccf381" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                                    <XAxis dataKey="date" stroke="#555" fontSize={11} tickLine={false} axisLine={false} minTickGap={50} />
                                    <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0d0d0d', borderColor: '#333', color: '#fff', borderRadius: '12px' }}
                                        formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Performance']}
                                    />
                                    <Area type="monotone" dataKey="percent" stroke="#ccf381" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPublic)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Strategy Breakdown */}
                {strategies.length > 0 && (
                    <Card className="relative border-0 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                        <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
                                Strategy Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4 space-y-2">
                            {strategies.map((s: any) => (
                                <div key={s.name} className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#ccf381]/10 border border-[#ccf381]/25 text-[#ccf381]">#{s.name}</span>
                                        <span className="text-xs text-gray-500">{s.count} trades</span>
                                    </div>
                                    <span className={`text-sm font-black ${s.winRate >= 50 ? 'text-[#ccf381]' : 'text-red-400'}`}>{s.winRate}% WR</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Win/Loss Distribution */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Wins</p>
                        <p className="text-3xl font-black text-[#ccf381]">{stats.winCount}</p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Losses</p>
                        <p className="text-3xl font-black text-red-400">{stats.lossCount}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-700 pt-4 border-t border-white/5">
                    <p>Powered by Trading Journal • Real verified trading data</p>
                </div>
            </div>
        </div>
    )
}

function StatsCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: any, color: string }) {
    const colorMap: Record<string, string> = {
        green: 'text-[#ccf381] bg-[#ccf381]/10 border-[#ccf381]/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    }
    const cls = colorMap[color] || colorMap.blue

    return (
        <Card className="relative border-0 shadow-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
            <CardContent className="p-4 relative z-10">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-2 ${cls}`}>
                    {icon}
                </div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">{label}</p>
                <h3 className="text-xl font-black text-white">{value}</h3>
            </CardContent>
        </Card>
    )
}

import { createClient } from '@/utils/supabase/server'
import { Trophy, TrendingUp, Search, Crown, ArrowLeft, Activity, Target, Zap } from 'lucide-react'
import Link from 'next/link'
import { getCurrentLanguage, getDictionary } from '@/utils/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireVerifiedUser } from '@/utils/verify-client-id'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'

// Rank Badge System
function getRankBadge(totalTrades: number, netProfit: number, winRate: number, dict: any) {
    if (totalTrades >= 200 && netProfit >= 10000 && winRate >= 75) {
        return { badge: '🌟', name: dict?.leaderboard?.badges?.master || 'Master', color: 'from-yellow-400 to-yellow-600' }
    } else if (totalTrades >= 100 && netProfit >= 5000 && winRate >= 70) {
        return { badge: '👑', name: dict?.leaderboard?.badges?.diamond || 'Diamond', color: 'from-cyan-400 to-blue-600' }
    } else if (totalTrades >= 50 && netProfit >= 2000 && winRate >= 60) {
        return { badge: '💎', name: dict?.leaderboard?.badges?.platinum || 'Platinum', color: 'from-purple-400 to-purple-600' }
    } else if (totalTrades >= 20 && netProfit >= 500 && winRate >= 50) {
        return { badge: '⚡', name: dict?.leaderboard?.badges?.gold || 'Gold', color: 'from-yellow-500 to-yellow-700' }
    } else if (totalTrades >= 10 && netProfit >= 100) {
        return { badge: '🔵', name: dict?.leaderboard?.badges?.silver || 'Silver', color: 'from-gray-300 to-gray-500' }
    } else {
        return { badge: '🔴', name: dict?.leaderboard?.badges?.bronze || 'Bronze', color: 'from-orange-600 to-orange-800' }
    }
}

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const lang = await getCurrentLanguage()
    const dict = await getDictionary(lang)

    // Call the enhanced RPC function
    const { data: leaderboard, error } = await supabase.rpc('get_leaderboard')

    if (error) {
        console.error('Error fetching leaderboard:', error)
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ccf381] blur-[150px] opacity-10 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ccf381] blur-[150px] opacity-10 rounded-full pointer-events-none" />

            <StaggerContainer className="max-w-7xl mx-auto space-y-12 relative z-10">

                {/* Header */}
                <StaggerItem className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase sm:whitespace-nowrap bg-gradient-to-r from-white via-[#ccf381] to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(204,243,129,0.3)]">
                        🏆 {dict.leaderboard.title}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {dict.leaderboard.subtitle}
                    </p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10">
                        <ArrowLeft className="w-4 h-4" />
                        {dict.leaderboard.backToDashboard}
                    </Link>
                </StaggerItem>

                {/* Top 3 Podium */}
                <StaggerItem className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 items-end">
                    {/* Rank 2 */}
                    {leaderboard?.[1] && (
                        <Card key={leaderboard[1].out_user_id} className="border-[#333] bg-[#1a1a1a]/60 backdrop-blur-md relative group hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">🥈</div>
                            <CardHeader className="text-center pt-10 pb-2">
                                {leaderboard[1].avatar_url && (
                                    <img
                                        src={leaderboard[1].avatar_url}
                                        alt={leaderboard[1].username || leaderboard[1].full_name || dict?.leaderboard?.traderDefault || 'Trader'}
                                        className="w-16 h-16 rounded-full border-2 border-gray-400 mx-auto mb-3"
                                    />
                                )}
                                <CardTitle className="text-xl font-bold text-gray-200">
                                    {leaderboard[1].username || leaderboard[1].full_name || dict?.leaderboard?.anonymous || 'Anonymous'}
                                </CardTitle>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{dict.leaderboard.runnerUp}</p>
                                <div className="mt-2">
                                    <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${getRankBadge(leaderboard[1].total_trades, leaderboard[1].net_profit, leaderboard[1].win_rate, dict).color} text-white font-bold`}>
                                        {getRankBadge(leaderboard[1].total_trades, leaderboard[1].net_profit, leaderboard[1].win_rate, dict).badge} {getRankBadge(leaderboard[1].total_trades, leaderboard[1].net_profit, leaderboard[1].win_rate, dict).name}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pb-6">
                                <div className="text-3xl font-black text-white">
                                    ${leaderboard[1].net_profit?.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 flex justify-center gap-2 flex-wrap">
                                    <span className="bg-[#333] px-2 py-1 rounded">{dict?.leaderboard?.winRateShort || 'WR'}: {leaderboard[1].win_rate}%</span>
                                    <span className="bg-[#333] px-2 py-1 rounded">{dict?.leaderboard?.tradesLabel || 'Trades'}: {leaderboard[1].total_trades}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rank 1 (Champion) */}
                    {leaderboard?.[0] && (
                        <Card key={leaderboard[0].out_user_id} className="border-[#ccf381] bg-[#1a1a1a]/80 backdrop-blur-md relative scale-110 z-10 shadow-[0_0_50px_rgba(204,243,129,0.15)] group hover:-translate-y-3 transition-transform duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-7xl drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">👑</div>
                            <div className="absolute inset-0 bg-gradient-to-b from-[#ccf381]/10 to-transparent pointer-events-none rounded-xl" />
                            <CardHeader className="text-center pt-12 pb-2">
                                {leaderboard[0].avatar_url && (
                                    <img
                                        src={leaderboard[0].avatar_url}
                                        alt={leaderboard[0].username || leaderboard[0].full_name || dict?.leaderboard?.championDefault || 'Champion'}
                                        className="w-20 h-20 rounded-full border-4 border-[#ccf381] mx-auto mb-3 shadow-lg shadow-[#ccf381]/30"
                                    />
                                )}
                                <CardTitle className="text-2xl font-black text-[#ccf381] drop-shadow-md">
                                    {leaderboard[0].username || leaderboard[0].full_name || dict?.leaderboard?.anonymous || 'Anonymous'}
                                </CardTitle>
                                <p className="text-xs text-[#ccf381]/80 uppercase tracking-widest font-bold">{dict.leaderboard.champion}</p>
                                <div className="mt-2">
                                    <span className={`text-sm px-3 py-1 rounded bg-gradient-to-r ${getRankBadge(leaderboard[0].total_trades, leaderboard[0].net_profit, leaderboard[0].win_rate, dict).color} text-white font-bold shadow-lg`}>
                                        {getRankBadge(leaderboard[0].total_trades, leaderboard[0].net_profit, leaderboard[0].win_rate, dict).badge} {getRankBadge(leaderboard[0].total_trades, leaderboard[0].net_profit, leaderboard[0].win_rate, dict).name}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pb-8">
                                <div className="text-4xl font-black text-white drop-shadow-md">
                                    ${leaderboard[0].net_profit?.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-300 flex justify-center gap-2 flex-wrap">
                                    <span className="bg-[#ccf381]/20 text-[#ccf381] px-3 py-1 rounded border border-[#ccf381]/20">{dict.leaderboard.winRate}: {leaderboard[0].win_rate}%</span>
                                    <span className="bg-[#333] px-3 py-1 rounded border border-[#333]">{dict.leaderboard.trades}: {leaderboard[0].total_trades}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rank 3 */}
                    {leaderboard?.[2] && (
                        <Card key={leaderboard[2].out_user_id} className="border-[#333] bg-[#1a1a1a]/60 backdrop-blur-md relative group hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">🥉</div>
                            <CardHeader className="text-center pt-10 pb-2">
                                {leaderboard[2].avatar_url && (
                                    <img
                                        src={leaderboard[2].avatar_url}
                                        alt={leaderboard[2].username || leaderboard[2].full_name || dict?.leaderboard?.traderDefault || 'Trader'}
                                        className="w-16 h-16 rounded-full border-2 border-orange-600 mx-auto mb-3"
                                    />
                                )}
                                <CardTitle className="text-xl font-bold text-gray-200">
                                    {leaderboard[2].username || leaderboard[2].full_name || dict?.leaderboard?.anonymous || 'Anonymous'}
                                </CardTitle>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">{dict.leaderboard.thirdPlace}</p>
                                <div className="mt-2">
                                    <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${getRankBadge(leaderboard[2].total_trades, leaderboard[2].net_profit, leaderboard[2].win_rate, dict).color} text-white font-bold`}>
                                        {getRankBadge(leaderboard[2].total_trades, leaderboard[2].net_profit, leaderboard[2].win_rate, dict).badge} {getRankBadge(leaderboard[2].total_trades, leaderboard[2].net_profit, leaderboard[2].win_rate, dict).name}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pb-6">
                                <div className="text-3xl font-black text-white">
                                    ${leaderboard[2].net_profit?.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 flex justify-center gap-2 flex-wrap">
                                    <span className="bg-[#333] px-2 py-1 rounded">{dict?.leaderboard?.winRateShort || 'WR'}: {leaderboard[2].win_rate}%</span>
                                    <span className="bg-[#333] px-2 py-1 rounded">{dict?.leaderboard?.tradesLabel || 'Trades'}: {leaderboard[2].total_trades}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </StaggerItem>

                {/* Full Leaderboard Table */}
                <StaggerItem className="bg-[#1a1a1a]/50 backdrop-blur-md rounded-2xl border border-[#333] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-[#0d0d0d] text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-bold text-[#ccf381]">{dict.leaderboard.rank}</th>
                                    <th className="p-4">{dict.leaderboard.trader}</th>
                                    <th className="p-4">{dict.leaderboard.badge}</th>
                                    <th className="p-4 text-center">{dict.leaderboard.trades}</th>
                                    <th className="p-4 text-center">{dict.leaderboard.winRate}</th>
                                    <th className="p-4 text-right">{dict.leaderboard.netProfit}</th>
                                    <th className="p-4 text-right">{dict.leaderboard.avgTrade}</th>
                                    <th className="p-4 text-right">{dict.leaderboard.bestTrade}</th>
                                    <th className="p-4 text-center">{dict.leaderboard.streak}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#222]">
                                {leaderboard?.map((trader: any, index: number) => {
                                    const rank = getRankBadge(trader.total_trades, trader.net_profit, trader.win_rate, dict)
                                    const isCurrentUser = trader.out_user_id === user?.id
                                    return (
                                        <tr
                                            key={trader.out_user_id}
                                            className={`hover:bg-[#ccf381]/5 transition-colors group ${isCurrentUser ? 'bg-[#ccf381]/10 border-l-4 border-l-[#ccf381]' : ''}`}
                                        >
                                            <td className="p-4 font-mono text-gray-500 group-hover:text-[#ccf381] font-bold">
                                                #{index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {trader.avatar_url && (
                                                        <img
                                                            src={trader.avatar_url}
                                                            alt={trader.username || trader.full_name}
                                                            className="w-8 h-8 rounded-full border border-gray-600"
                                                        />
                                                    )}
                                                    <span className={`font-bold ${isCurrentUser ? 'text-[#ccf381]' : 'text-white'} group-hover:translate-x-1 transition-transform`}>
                                                        {trader.username || trader.full_name || dict?.leaderboard?.anonymous || 'Anonymous'}
                                                        {isCurrentUser && <span className="ml-2 text-xs">({dict?.leaderboard?.you || 'You'})</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${rank.color} text-white font-bold`}>
                                                    {rank.badge} {rank.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-gray-400">
                                                {trader.total_trades}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-[#222] px-2 py-1 rounded text-xs text-gray-300">
                                                    {trader.win_rate}%
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-black ${trader.net_profit >= 0 ? 'text-[#ccf381]' : 'text-red-500'}`}>
                                                ${trader.net_profit?.toLocaleString()}
                                            </td>
                                            <td className={`p-4 text-right text-sm ${trader.avg_trade >= 0 ? 'text-gray-300' : 'text-red-400'}`}>
                                                ${trader.avg_trade?.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right text-sm text-green-400">
                                                ${trader.best_trade?.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-[#222] px-2 py-1 rounded text-xs text-[#ccf381]">
                                                    {trader.current_streak > 0 ? `🔥 ${trader.current_streak}` : '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {(!leaderboard || leaderboard.length === 0) && (
                        <div className="p-12 text-center text-gray-600 italic">
                            {dict.leaderboard.noRanked}
                        </div>
                    )}
                </StaggerItem>

            </StaggerContainer>
        </div>
    )
}

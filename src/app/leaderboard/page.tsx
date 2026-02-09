import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Call the RPC function we just created
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

            <div className="max-w-5xl mx-auto space-y-12 relative z-10">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase whitespace-nowrap bg-gradient-to-r from-white via-[#ccf381] to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(204,243,129,0.3)]">
                        🏆 Hall of Fame
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Celebrating the top performers who have mastered discipline and strategy.
                    </p>
                    <a href="/dashboard" className="inline-flex items-center text-sm font-bold text-[#ccf381] hover:text-[#b0d16a] transition-colors mt-4 border border-[#ccf381]/30 px-4 py-2 rounded-full hover:bg-[#ccf381]/10">
                        ← Back to Dashboard
                    </a>
                </div>

                {/* Top 3 List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 items-end">
                    {/* Rank 2 */}
                    {leaderboard?.[1] && (
                        <Card key={leaderboard[1].username} className="border-[#333] bg-[#1a1a1a]/60 backdrop-blur-md relative group hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">🥈</div>
                            <CardHeader className="text-center pt-10 pb-2">
                                <CardTitle className="text-xl font-bold text-gray-200">
                                    {leaderboard[1].username || leaderboard[1].full_name || 'Anonymous'}
                                </CardTitle>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Runner Up</p>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pb-6">
                                <div className="text-3xl font-black text-white">
                                    ${leaderboard[1].net_profit?.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 flex justify-center gap-3">
                                    <span className="bg-[#333] px-2 py-1 rounded">Wr: {leaderboard[1].win_rate}%</span>
                                    <span className="bg-[#333] px-2 py-1 rounded">T: {leaderboard[1].total_trades}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rank 1 */}
                    {leaderboard?.[0] && (
                        <Card key={leaderboard[0].username} className="border-[#ccf381] bg-[#1a1a1a]/80 backdrop-blur-md relative scale-110 z-10 shadow-[0_0_50px_rgba(204,243,129,0.15)] group hover:-translate-y-3 transition-transform duration-300">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-7xl drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">👑</div>
                            <div className="absolute inset-0 bg-gradient-to-b from-[#ccf381]/10 to-transparent pointer-events-none rounded-xl" />
                            <CardHeader className="text-center pt-12 pb-2">
                                <CardTitle className="text-2xl font-black text-[#ccf381] drop-shadow-md">
                                    {leaderboard[0].username || leaderboard[0].full_name || 'Anonymous'}
                                </CardTitle>
                                <p className="text-xs text-[#ccf381]/80 uppercase tracking-widest font-bold">Champion</p>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pb-8">
                                <div className="text-4xl font-black text-white drop-shadow-md">
                                    ${leaderboard[0].net_profit?.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-300 flex justify-center gap-3">
                                    <span className="bg-[#ccf381]/20 text-[#ccf381] px-3 py-1 rounded border border-[#ccf381]/20">Win Rate: {leaderboard[0].win_rate}%</span>
                                    <span className="bg-[#333] px-3 py-1 rounded border border-[#333]">Trades: {leaderboard[0].total_trades}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rank 3 */}
                    {leaderboard?.[2] && (
                        <Card key={leaderboard[2].username} className="border-[#333] bg-[#1a1a1a]/60 backdrop-blur-md relative group hover:-translate-y-2 transition-transform duration-300">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg">🥉</div>
                            <CardHeader className="text-center pt-10 pb-2">
                                <CardTitle className="text-xl font-bold text-gray-200">
                                    {leaderboard[2].username || leaderboard[2].full_name || 'Anonymous'}
                                </CardTitle>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">3rd Place</p>
                            </CardHeader>
                            <CardContent className="text-center space-y-2 pb-6">
                                <div className="text-3xl font-black text-white">
                                    ${leaderboard[2].net_profit?.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400 flex justify-center gap-3">
                                    <span className="bg-[#333] px-2 py-1 rounded">Wr: {leaderboard[2].win_rate}%</span>
                                    <span className="bg-[#333] px-2 py-1 rounded">T: {leaderboard[2].total_trades}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* The Rest Table */}
                <div className="bg-[#1a1a1a]/50 backdrop-blur-md rounded-2xl border border-[#333] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#0d0d0d] text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-5 font-bold text-[#ccf381]">Rank</th>
                                <th className="p-5">Trader</th>
                                <th className="p-5 text-center">Win Rate</th>
                                <th className="p-5 text-right">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222]">
                            {leaderboard?.slice(3).map((trader: any, index: number) => (
                                <tr key={trader.username} className="hover:bg-[#ccf381]/5 transition-colors group">
                                    <td className="p-5 font-mono text-gray-500 group-hover:text-[#ccf381]">#{index + 4}</td>
                                    <td className="p-5 font-bold text-white group-hover:translate-x-1 transition-transform">
                                        {trader.username || trader.full_name || 'Anonymous'}
                                    </td>
                                    <td className="p-5 text-center text-gray-400">
                                        <span className="bg-[#222] px-2 py-1 rounded text-xs">{trader.win_rate}%</span>
                                    </td>
                                    <td className={`p-5 text-right font-black ${trader.net_profit >= 0 ? 'text-[#ccf381]' : 'text-red-500'}`}>
                                        ${trader.net_profit?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!leaderboard || leaderboard.length <= 3) && (
                        <div className="p-12 text-center text-gray-600 italic">
                            {leaderboard && leaderboard.length > 0 ? "That's everyone for now!" : "No ranked traders yet. Be the first!"}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

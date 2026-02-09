import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTrades, getTradeStats, getProfileGoals } from './actions'
import { TradeForm } from './TradeForm'
import { Card, CardContent } from '@/components/ui/card'
import { EquityChart } from './EquityChart'
import { CalendarWidget } from './CalendarWidget'
import { AIAnalysis } from './AIAnalysis'
import { ProfitTree } from './ProfitTree'
import { TrendingUp, Activity, BarChart2 } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch data
    const trades = await getTrades()
    const stats = await getTradeStats()
    const goals = await getProfileGoals()

    const portSize = goals?.port_size || 1000
    const goalPercent = goals?.profit_goal_percent || 10

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-gray-500">Welcome back, let&apos;s grow your portfolio.</p>
                </div>

                {/* Quick Actions / Date? */}
                <div className="flex items-center gap-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Top Grid: Stats & Profit Tree */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left: Key Metrics (3 Cards Vertical or Grid) - Col 4 */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* Net Revenue / Net Profit */}
                    <Card className="relative overflow-hidden group border-0 shadow-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                        <div className="absolute -inset-[1px] bg-gradient-to-b from-[#ccf381]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />

                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 z-10">
                            <TrendingUp className="w-32 h-32 text-[#ccf381]" />
                        </div>
                        <CardContent className="p-6 relative z-30">
                            <p className="text-gray-500 font-medium mb-1 tracking-wide text-xs uppercase">Net Profit</p>
                            <h3 className={`text-5xl font-bold tracking-tight ${Number(stats.netProfit) >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]' : 'text-red-400'}`}>
                                ${Number(stats.netProfit).toLocaleString()}
                            </h3>
                            <div className="flex items-center gap-2 mt-4">
                                <span className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1 font-medium ${Number(stats.netProfit) >= 0 ? 'bg-[#ccf381]/10 border-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    {Number(stats.netProfit) >= 0 ? '↗' : '↘'} {stats.winRate}% Win Rate
                                </span>
                                <span className="text-xs text-gray-600">vs last period</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Trades & Win Rate Split */}
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        <Card className="relative overflow-hidden group border-0 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/20 transition-colors duration-300" />

                            <CardContent className="p-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                                    <Activity className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Trades</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{stats.totalTrades}</h3>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden group border-0 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/30 transition-colors duration-300" />
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#ccf381]/5 blur-2xl rounded-full group-hover:bg-[#ccf381]/10 transition-colors duration-500" />

                            <CardContent className="p-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ccf381]/20 to-[#ccf381]/5 border border-[#ccf381]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(204,243,129,0.1)]">
                                    <BarChart2 className="w-5 h-5 text-[#ccf381]" />
                                </div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Win Rate</p>
                                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]">{stats.winRate}%</h3>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right: Profit Tree Big Card - Col 8 */}
                <div className="col-span-12 lg:col-span-8 h-full">
                    <ProfitTree netProfit={Number(stats.netProfit)} portSize={Number(portSize)} goalPercent={Number(goalPercent)} />
                </div>
            </div>

            {/* Middle Grid: Charts & Calendar */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                    {/* Equity Chart */}
                    <EquityChart trades={trades} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <div className="h-full">
                        <CalendarWidget trades={trades} />
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Recent Trades & Trade Form */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
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
                                        <th className="p-4 text-center rounded-tr-xl">Analysis</th>
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
                                            <tr key={trade.id} className="hover:bg-[#252525] transition-colors group border-b border-[#252525] last:border-0">
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
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <div className="sticky top-6">
                        <h2 className="text-xl font-bold text-white mb-4">Quick Trade</h2>
                        <TradeForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

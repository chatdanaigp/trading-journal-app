import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTrades, getTradeStats, getProfileGoals } from './actions'
import { TradeForm } from './TradeForm'
import { Card, CardContent } from '@/components/ui/card'
import { EquityChart } from './EquityChart'
import { CalendarWidget } from './CalendarWidget'
import { ProfitTree } from './ProfitTree'
import { TrendingUp, Activity, BarChart2 } from 'lucide-react'
import { TradeList } from './TradeList'
import { AdvancedStats } from './AdvancedStats'
import { requireVerifiedUser } from '@/utils/verify-client-id'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import { getTradingDay } from '@/utils/date-helpers'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { getCurrentLanguage, getDictionary } from '@/utils/dictionaries'
import { CelebrationModal } from '@/components/ui/CelebrationModal'

export default async function DashboardPage() {
    // Server-side check: redirects to /verify if user has no client_id
    const { user, clientId, isAdmin } = await requireVerifiedUser()
    const lang = await getCurrentLanguage()
    const dict = getDictionary(lang)

    // Get display name for Share Card — Discord Display Name takes priority
    const supabase = await (await import('@/utils/supabase/server')).createClient()
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    const username = (user.user_metadata?.full_name as string)
        || (user.user_metadata?.name as string)
        || profile?.username
        || user.email?.split('@')[0]
        || 'Trader'

    // Fetch data
    const trades = await getTrades()
    const stats = await getTradeStats()
    const goals = await getProfileGoals()

    const portSize = goals?.port_size || 1000
    const goalPercent = goals?.profit_goal_percent || 10

    // Points aggregation logic
    const today = getTradingDay(new Date())
    let monthlyPoints = 0
    let weeklyPoints = 0
    let dailyPoints = 0
    let dailyProfit = 0

    trades.forEach(trade => {
        const lot = trade.lot_size || 0.01 // Fallback to avoid div by zero
        const profit = trade.profit || 0
        const points = lot !== 0 ? Math.round(profit / lot) : 0
        const tradeDay = getTradingDay(trade.created_at)

        if (isSameMonth(tradeDay, today)) monthlyPoints += points
        // weekStartsOn 1 = Monday
        if (isSameWeek(tradeDay, today, { weekStartsOn: 1 })) weeklyPoints += points
        if (isSameDay(tradeDay, today)) {
            dailyPoints += points
            dailyProfit += profit
        }
    })

    const TRADING_DAYS_PER_MONTH = 20
    const monthlyGoalAmount = portSize * (goalPercent / 100)
    const dailyTargetAmount = monthlyGoalAmount / TRADING_DAYS_PER_MONTH
    const isQuestActive = goals?.is_portfolio_quest_active || false

    return (
        <StaggerContainer className="space-y-8">
            <CelebrationModal dailyTarget={dailyTargetAmount} netToday={dailyProfit} isQuestActive={isQuestActive} dict={dict} />
            {/* Header */}
            <StaggerItem>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{dict.dashboard.overview}</h1>
                        <p className="text-gray-500 text-sm lg:text-base">{dict.dashboard.welcome}</p>
                    </div>

                    {/* Quick Actions / Date? */}
                    <div className="flex flex-wrap items-center gap-3">
                        <LanguageToggle />
                        {clientId && (
                            <div className="bg-[#ccf381]/10 border border-[#ccf381]/20 rounded-full px-4 py-2 text-sm text-[#ccf381] font-mono font-semibold hidden sm:flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                </svg>
                                Connext ID: {clientId}
                            </div>
                        )}
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400 hidden sm:block">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </StaggerItem>

            {/* Top Grid: Stats & Profit Tree */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left: Key Metrics (3 Cards Vertical or Grid) - Col 4 */}
                <StaggerItem className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* Net Revenue / Net Profit */}
                    <Card className="relative overflow-hidden group border-0 shadow-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                        <div className="absolute -inset-[1px] bg-gradient-to-b from-[#ccf381]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />

                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 z-10">
                            <TrendingUp className="w-32 h-32 text-[#ccf381]" />
                        </div>
                        <CardContent className="p-6 relative z-30">
                            <p className="text-gray-500 font-medium mb-1 tracking-wide text-xs uppercase">{dict.dashboard.netProfit}</p>
                            <h3 className={`text-5xl font-bold tracking-tight ${Number(stats.netProfit) >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]' : 'text-red-400'}`}>
                                ${Number(stats.netProfit).toLocaleString()}
                            </h3>
                            <div className="flex items-center gap-2 mt-4">
                                <span className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1 font-medium ${Number(stats.netProfit) >= 0 ? 'bg-[#ccf381]/10 border-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    {Number(stats.netProfit) >= 0 ? '↗' : '↘'} {stats.winRate}% {dict.dashboard.winRate}
                                </span>
                                <span className="text-xs text-gray-600">{dict.dashboard.vsLastPeriod}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Trades & Win Rate Split */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="relative overflow-hidden group border-0 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/20 transition-colors duration-300" />

                            <CardContent className="p-6 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                                    <Activity className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.dashboard.totalTrades}</p>
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
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">{dict.dashboard.winRate}</p>
                                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]">{stats.winRate}%</h3>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Total Points Display */}
                    <Card className="flex-1 relative overflow-hidden group border-0 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/20 transition-colors duration-300" />

                        <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">{dict.dashboard.pointsThisMonth}</p>
                            <h3 className={`text-5xl font-bold tracking-tight mb-4 ${monthlyPoints >= 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]' : 'text-red-400'}`}>
                                {monthlyPoints > 0 ? '+' : ''}{monthlyPoints.toLocaleString()} <span className="text-lg text-gray-400 font-normal">pts</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">{dict.dashboard.today}</p>
                                    <p className={`text-lg font-bold ${dailyPoints > 0 ? 'text-[#ccf381]' : dailyPoints < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                        {dailyPoints > 0 ? '+' : ''}{dailyPoints.toLocaleString()} pts
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">{dict.dashboard.thisWeek}</p>
                                    <p className={`text-lg font-bold ${weeklyPoints > 0 ? 'text-[#ccf381]' : weeklyPoints < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                        {weeklyPoints > 0 ? '+' : ''}{weeklyPoints.toLocaleString()} pts
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </StaggerItem>

                {/* Right: Profit Tree Big Card - Col 8 */}
                <StaggerItem className="col-span-12 lg:col-span-8 h-full">
                    <ProfitTree netProfit={Number(stats.netProfit)} portSize={Number(portSize)} goalPercent={Number(goalPercent)} dict={dict} />
                </StaggerItem>
            </div>

            {/* Middle Grid: Charts & Calendar */}
            <div className="grid grid-cols-12 gap-6">
                <StaggerItem className="col-span-12">
                    <AdvancedStats stats={stats as any} dict={dict} />
                </StaggerItem>
                <StaggerItem className="col-span-12 lg:col-span-8">
                    {/* Equity Chart */}
                    <EquityChart trades={trades} dict={dict} />
                </StaggerItem>
                <StaggerItem className="col-span-12 lg:col-span-4">
                    <div className="h-full">
                        <CalendarWidget trades={trades} dict={dict} />
                    </div>
                </StaggerItem>
            </div>

            {/* Bottom Grid: Recent Trades & Trade Form */}
            <div className="grid grid-cols-12 gap-6">
                <StaggerItem className="col-span-12 lg:col-span-8">
                    <TradeList trades={trades} username={username} dict={dict} />
                </StaggerItem>

                <StaggerItem className="col-span-12 lg:col-span-4">
                    <div className="sticky top-6">
                        <h2 className="text-xl font-bold text-white mb-4">{dict.dashboard.quickTrade}</h2>
                        <TradeForm dict={dict} />
                    </div>
                </StaggerItem>
            </div>
        </StaggerContainer>
    )
}

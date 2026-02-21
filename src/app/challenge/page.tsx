import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/Sidebar'
import { getDictionary, getCurrentLanguage } from '@/utils/dictionaries'
import { getProfileGoals, getTrades } from '@/app/dashboard/actions'
import { Target, Trophy, Clock, Lock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'

export default async function ChallengePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

    const currentLang = await getCurrentLanguage()
    const dict = getDictionary(currentLang)

    const goals = await getProfileGoals()
    const trades = await getTrades()

    // Configuration
    const TRADING_DAYS_PER_MONTH = 20
    const portSize = goals ? Number(goals.port_size) : 1000
    const goalPercent = goals ? Number(goals.profit_goal_percent) : 10

    // Calculations
    const monthlyGoalAmount = portSize * (goalPercent / 100)
    const dailyTargetAmount = monthlyGoalAmount / TRADING_DAYS_PER_MONTH

    // Today's Profit
    const getTradingDay = (dateStr: string) => {
        const d = new Date(dateStr)
        const day = d.getDay()
        if (day === 6) { d.setDate(d.getDate() - 1); d.setHours(23, 59, 59, 999) }
        else if (day === 0) { d.setDate(d.getDate() - 2); d.setHours(23, 59, 59, 999) }
        else if (d.getHours() >= 4) { d.setDate(d.getDate() + 1) }
        return d.toISOString().split('T')[0]
    }

    const now = new Date()
    const mockCreatedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)
    const currentTradingDayStr = getTradingDay(mockCreatedDate.toISOString())

    const todayTrades = trades.filter((t: any) => {
        if (!t.created_at) return false
        return getTradingDay(t.created_at) === currentTradingDayStr
    })

    const netProfitToday = todayTrades.reduce((sum: number, t: any) => sum + (t.profit || 0), 0)
    const profitFactor = 0 // Mock calculation could be added if needed for challenges

    // Admin Quests (Hardcoded logic for MVP)
    const quests = [
        {
            title: dict.challenge.quest1Title,
            description: dict.challenge.quest1Desc,
            icon: Trophy,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            borderColor: 'border-amber-400/20',
            completed: trades.some((t: any) => (t.profit || 0) > 0)
        },
        {
            title: dict.challenge.quest2Title,
            description: dict.challenge.quest2Desc,
            icon: Target,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            borderColor: 'border-blue-400/20',
            completed: false // Requires calculating PF > 1.5 globally
        },
        {
            title: dict.challenge.quest3Title,
            description: dict.challenge.quest3Desc,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            borderColor: 'border-emerald-400/20',
            completed: false // Requires checking total equity
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <div className="hidden lg:block">
                <Sidebar dict={dict} />
            </div>
            <div className="lg:hidden">
                <Sidebar dict={dict} />
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#2a2a2a] p-8 lg:p-12 mb-8">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ccf381]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccf381]/10 border border-[#ccf381]/20 text-[#ccf381] text-xs font-bold mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            {dict.challenge.title}
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase mb-4">
                            TEST YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccf381] to-[#a3d149]">LIMITS</span>
                        </h1>
                        <p className="text-gray-400 text-sm lg:text-base max-w-xl">
                            {dict.challenge.subtitle}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Admin Quests */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="w-6 h-6 text-amber-400" />
                            <h2 className="text-xl font-bold">{dict.challenge.adminQuests}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quests.map((quest, i) => (
                                <div
                                    key={i}
                                    className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${quest.completed
                                            ? `border-[#ccf381]/30 bg-[#ccf381]/5`
                                            : `border-[#2a2a2a] bg-[#151515]`
                                        }`}
                                >
                                    {/* Completion Badge */}
                                    {quest.completed && (
                                        <div className="absolute top-4 right-4 text-[#ccf381] flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-[#ccf381]/10 px-2 py-1 rounded-md">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {dict.challenge.unlocked}
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${quest.completed ? 'bg-[#ccf381]/20 text-[#ccf381]' : quest.bg + ' ' + quest.color}`}>
                                        <quest.icon className="w-6 h-6" />
                                    </div>

                                    <h3 className={`text-lg font-bold mb-2 ${quest.completed ? 'text-white' : 'text-gray-300'}`}>
                                        {quest.title}
                                    </h3>
                                    <p className={`text-sm ${quest.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {quest.description}
                                    </p>

                                    {/* Lock overlay if not completed */}
                                    {!quest.completed && (
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-600 bg-[#0d0d0d] rounded-lg px-3 py-2 w-fit">
                                            <Lock className="w-3.5 h-3.5" />
                                            {dict.challenge.locked}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Portfolio Quest (Daily Target) */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#151515] border border-[#2a2a2a] rounded-3xl p-6 lg:p-8 sticky top-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#ccf381]/20 border border-[#ccf381]/30 flex items-center justify-center">
                                            <Target className="w-4 h-4 text-[#ccf381]" />
                                        </div>
                                        <h2 className="text-xl font-bold">{dict.challenge.portfolioQuest}</h2>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {dict.challenge.tradingDays}
                                    </p>
                                </div>
                            </div>

                            {/* Math Config Display */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{dict.challenge.portSize}</p>
                                    <p className="text-lg font-bold text-white">${portSize.toLocaleString()}</p>
                                </div>
                                <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-4">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{dict.challenge.monthlyGoal}</p>
                                    <p className="text-lg font-bold text-[#ccf381]">{goalPercent}% <span className="text-sm font-normal text-gray-500">(${monthlyGoalAmount.toLocaleString()})</span></p>
                                </div>
                            </div>

                            {/* Today's Target Calculation */}
                            <div className="mb-8">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">{dict.challenge.dailyTarget}</p>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl lg:text-5xl font-black tracking-tighter text-white">
                                        ${dailyTargetAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-white/5 my-8" />

                            {/* Today's Progress Bar */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-sm font-bold text-gray-400">{dict.challenge.netToday}</p>
                                    <div className="text-right">
                                        <span className={`text-xl font-bold ${netProfitToday >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                            ${netProfitToday.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-4 bg-[#0d0d0d] rounded-full overflow-hidden border border-white/5 relative">
                                    {netProfitToday > 0 && (
                                        <div
                                            className="h-full bg-gradient-to-r from-[#a3d149] to-[#ccf381] rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min((netProfitToday / dailyTargetAmount) * 100, 100)}%` }}
                                        />
                                    )}
                                </div>

                                {netProfitToday >= dailyTargetAmount ? (
                                    <div className="mt-4 p-3 bg-[#ccf381]/10 border border-[#ccf381]/20 rounded-xl flex items-start gap-3">
                                        <div className="shrink-0 pt-0.5">
                                            <Sparkles className="w-4 h-4 text-[#ccf381]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#ccf381]">{dict.challenge.hitTarget}</p>
                                            <p className="text-xs text-[#ccf381]/70">You completed your daily objective!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-center text-gray-500 mt-4 font-medium italic">
                                        {dict.challenge.keepGoing}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Target, Clock, Sparkles, DollarSign, Percent, Loader2, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileGoals } from '@/app/dashboard/actions'

export function PortfolioQuestClient({
    dict,
    initialPortSize,
    initialGoalPercent,
    isQuestActive,
    netProfitToday
}: {
    dict: any
    initialPortSize: number
    initialGoalPercent: number
    isQuestActive: boolean
    netProfitToday: number
}) {
    const [isActive, setIsActive] = useState(isQuestActive)
    const [portSize, setPortSize] = useState(initialPortSize)
    const [goalPercent, setGoalPercent] = useState(initialGoalPercent)
    const [isLoading, setIsLoading] = useState(false)

    const TRADING_DAYS_PER_MONTH = 20
    const monthlyGoalAmount = portSize * (goalPercent / 100)
    const dailyTargetAmount = monthlyGoalAmount / TRADING_DAYS_PER_MONTH

    const handleToggleQuest = async (newStatus: boolean) => {
        setIsLoading(true)
        await updateProfileGoals(Number(portSize), Number(goalPercent), newStatus)
        setIsActive(newStatus)
        setIsLoading(false)
    }

    if (!isActive) {
        return (
            <div className="bg-[#151515] border border-[#2a2a2a] rounded-3xl p-6 lg:p-8 sticky top-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#ccf381]/20 border border-[#ccf381]/30 flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#ccf381]" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white">{dict.challenge.optInTitle}</h2>
                <p className="text-gray-400 text-sm mb-8">{dict.challenge.optInDesc}</p>

                <div className="space-y-4 mb-8">
                    <div className="space-y-1.5">
                        <Label htmlFor="port-size" className="text-xs text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" /> {dict.challenge.portSize}
                        </Label>
                        <Input
                            id="port-size"
                            type="number"
                            value={portSize}
                            onChange={(e) => setPortSize(Number(e.target.value))}
                            className="bg-[#0d0d0d] border-white/10 h-12 text-lg text-white focus:border-[#ccf381]/50 rounded-xl"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="goal-percent" className="text-xs text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5" /> {dict.challenge.targetPercent}
                        </Label>
                        <Input
                            id="goal-percent"
                            type="number"
                            value={goalPercent}
                            onChange={(e) => setGoalPercent(Number(e.target.value))}
                            className="bg-[#0d0d0d] border-white/10 h-12 text-lg text-white focus:border-[#ccf381]/50 rounded-xl"
                        />
                    </div>
                </div>

                <div className="bg-[#ccf381]/5 border border-[#ccf381]/20 rounded-2xl p-4 mb-8">
                    <p className="text-xs text-[#ccf381] font-bold uppercase tracking-wider mb-2">Calculated Targets</p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-sm text-gray-400">{dict.challenge.monthlyGoal}</p>
                            <p className="text-lg font-bold text-white">${monthlyGoalAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">{dict.challenge.dailyTarget}</p>
                            <p className="text-2xl font-black text-[#ccf381]">${dailyTargetAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => handleToggleQuest(true)}
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#ccf381] text-black font-bold text-lg hover:bg-[#d4f78e] transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.challenge.startQuest}
                </button>
            </div>
        )
    }

    return (
        <div className="bg-[#151515] border border-[#ccf381]/30 shadow-[0_0_40px_rgba(204,243,129,0.05)] rounded-3xl p-6 lg:p-8 sticky top-8 animate-in fade-in duration-500">
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

                {/* Cancel Quest Button */}
                <button
                    onClick={() => {
                        if (confirm(dict.challenge.cancelConfirm)) {
                            handleToggleQuest(false)
                        }
                    }}
                    disabled={isLoading}
                    className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                    title={dict.challenge.cancelQuest}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                </button>
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
    )
}

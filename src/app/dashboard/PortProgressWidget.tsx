'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'
import { Target, TrendingUp, Wallet } from 'lucide-react'

interface PortProgressWidgetProps {
    portSize: number
    goalPercent: number
    totalNetProfit: number
    netProfitToday: number
    dict: any
}

export function PortProgressWidget({
    portSize,
    goalPercent,
    netProfitToday,
    dict
}: Omit<PortProgressWidgetProps, 'totalNetProfit'>) {
    if (portSize <= 0 || goalPercent <= 0) return null

    const targetAmount = portSize * (goalPercent / 100)
    const dailyTargetAmount = targetAmount / 20 // Assuming 20 trading days
    const dailyProgress = Math.min(Math.max(0, (netProfitToday / dailyTargetAmount) * 100), 100)

    return (
        <div className="relative overflow-hidden group">
            <LazyMotion features={domAnimation}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#ccf381]/10 flex items-center justify-center border border-[#ccf381]/20">
                                <Target size={16} className="text-[#ccf381]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">{dict?.challenge?.dailyTitle || 'Daily Challenge'}</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{dict?.challenge?.todayGoal || "Today's Target"}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 font-bold block uppercase leading-none mb-1">{dict?.challenge?.progress || 'Progress'}</span>
                            <span className="text-xl font-black text-[#ccf381] leading-none">{dailyProgress.toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* Main Progress Bar Container */}
                    <div className="space-y-2">
                        <div className="relative h-5 bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden p-0.5 shadow-inner">
                            {/* Energy Flow Animation Background */}
                            <m.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ccf381]/5 to-transparent w-full h-full"
                                animate={{
                                    x: ['-100%', '100%'],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />

                            {/* The Actual Progress Bar */}
                            <m.div 
                                className="h-full rounded-lg bg-gradient-to-r from-[#86ab3d] via-[#ccf381] to-[#eaffbf] relative overflow-hidden shadow-[0_0_15px_rgba(204,243,129,0.3)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${dailyProgress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            >
                                {/* Wave Animation Layer */}
                                <m.div 
                                    className="absolute inset-0 opacity-40"
                                    animate={{ 
                                        x: [-20, 0],
                                    }}
                                    transition={{ 
                                        duration: 2, 
                                        repeat: Infinity, 
                                        ease: "linear" 
                                    }}
                                    style={{
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                                        backgroundSize: '100px 100%',
                                    }}
                                />
                            </m.div>
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-baseline gap-2">
                                <span className={`text-lg font-black ${netProfitToday >= 0 ? 'text-white' : 'text-red-400'}`}>
                                    ${netProfitToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-xs text-gray-500 font-bold">/ ${dailyTargetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${dailyProgress >= 100 ? 'bg-[#ccf381]/20 text-[#ccf381]' : 'bg-white/5 text-gray-500'}`}>
                                {dailyProgress >= 100 ? 'Challenge Completed' : 'In Progress'}
                            </div>
                        </div>
                    </div>
                </div>
            </LazyMotion>
        </div>
    )
}

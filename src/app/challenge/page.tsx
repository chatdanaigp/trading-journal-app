'use client'

import { useChallengeData } from '@/hooks/usePageData'
import { Sidebar } from '@/components/Sidebar'
import { Target, Trophy, Lock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import { PortfolioQuestClient } from './PortfolioQuestClient'
import { TopNavigation } from '@/components/TopNavigation'
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { useEffect, useState } from 'react'

function useLang() {
    const [dict, setDict] = useState<any>(null)
    useEffect(() => {
        const lang = (document.cookie.match(/tj_language=(\w+)/)?.[1] || 'EN') as 'EN' | 'TH'
        import('@/utils/dictionaries').then(mod => setDict(mod.dictionaries[lang]))
    }, [])
    return dict
}

function ChallengeSkeleton() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 space-y-8 animate-in fade-in duration-300">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                </div>
                <div className="lg:col-span-5"><Skeleton className="h-[400px] w-full rounded-xl" /></div>
            </div>
        </div>
    )
}

export default function ChallengePage() {
    const { data, isLoading } = useChallengeData()
    const dict = useLang()

    if (isLoading || !data || !dict) return <ChallengeSkeleton />

    const { trades, portSize, goalPercent, isQuestActive, quests: questData } = data

    const quests = [
        {
            title: dict.challenge.quest1Title,
            description: dict.challenge.quest1Desc,
            icon: Trophy,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            borderColor: 'border-amber-400/20',
            completed: questData[0]?.completed || false
        },
        {
            title: dict.challenge.quest2Title,
            description: dict.challenge.quest2Desc,
            icon: Target,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            borderColor: 'border-blue-400/20',
            completed: questData[1]?.completed || false
        },
        {
            title: dict.challenge.quest3Title,
            description: dict.challenge.quest3Desc,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            borderColor: 'border-emerald-400/20',
            completed: questData[2]?.completed || false
        }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            <div className="hidden lg:block"><Sidebar dict={dict} /></div>
            <div className="lg:hidden"><Sidebar dict={dict} /></div>

            <div className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 w-full">
                <div className="max-w-7xl mx-auto space-y-8">
                    <TopNavigation />

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
                            <p className="text-gray-400 text-sm lg:text-base max-w-xl">{dict.challenge.subtitle}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Trophy className="w-6 h-6 text-amber-400" />
                                <h2 className="text-xl font-bold">{dict.challenge.adminQuests}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quests.map((quest, i) => (
                                    <div key={i} className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${quest.completed ? 'border-[#ccf381]/30 bg-[#ccf381]/5' : 'border-[#2a2a2a] bg-[#151515]'}`}>
                                        {quest.completed && (
                                            <div className="absolute top-4 right-4 text-[#ccf381] flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-[#ccf381]/10 px-2 py-1 rounded-md">
                                                <CheckCircle2 className="w-3 h-3" />{dict.challenge.unlocked}
                                            </div>
                                        )}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${quest.completed ? 'bg-[#ccf381]/20 text-[#ccf381]' : quest.bg + ' ' + quest.color}`}>
                                            <quest.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className={`text-lg font-bold mb-2 ${quest.completed ? 'text-white' : 'text-gray-300'}`}>{quest.title}</h3>
                                        <p className={`text-sm ${quest.completed ? 'text-gray-400' : 'text-gray-500'}`}>{quest.description}</p>
                                        {!quest.completed && (
                                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-600 bg-[#0d0d0d] rounded-lg px-3 py-2 w-fit">
                                                <Lock className="w-3.5 h-3.5" />{dict.challenge.locked}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <PortfolioQuestClient
                                dict={dict}
                                initialPortSize={portSize}
                                initialGoalPercent={goalPercent}
                                isQuestActive={isQuestActive}
                                trades={trades}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

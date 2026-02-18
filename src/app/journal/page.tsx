import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getJournalEntries, getJournalStats } from './actions'
import { JournalForm } from './components/JournalForm'
import { JournalList } from './components/JournalList'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Flame, CheckCircle } from 'lucide-react'
import { requireVerifiedUser } from '@/utils/verify-client-id'

export default async function JournalPage() {
    // Server-side check: redirects to /verify if user has no client_id
    const { user } = await requireVerifiedUser()

    const [entries, stats] = await Promise.all([
        getJournalEntries(),
        getJournalStats(),
    ])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Journal</h1>
                    <p className="text-gray-500">Track your mindset and improve your discipline.</p>
                </div>
                <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Row 1: Stats Cards — Bento 4+4+4 */}
            <div className="grid grid-cols-12 gap-6">
                {/* Total Entries */}
                <div className="col-span-12 lg:col-span-4">
                    <Card className="relative overflow-hidden group border-0 shadow-2xl h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                        <div className="absolute -inset-[1px] bg-gradient-to-b from-[#ccf381]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-10 blur-sm" />
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-all z-10">
                            <BookOpen className="w-24 h-24 text-[#ccf381]" />
                        </div>

                        <CardContent className="p-6 relative z-30 flex flex-col justify-center h-full">
                            <p className="text-gray-500 font-medium mb-1 tracking-wide text-xs uppercase">Total Entries</p>
                            <h3 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]">
                                {stats.totalEntries}
                            </h3>
                            <p className="text-xs text-gray-600 mt-2">Journal entries recorded</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Streak */}
                <div className="col-span-12 lg:col-span-4">
                    <Card className="relative overflow-hidden group border-0 shadow-xl h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-orange-500/20 transition-colors duration-300" />

                        <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Flame className="w-6 h-6 text-orange-400" />
                            </div>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Writing Streak</p>
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-400">
                                {stats.streakDays} day{stats.streakDays !== 1 ? 's' : ''}
                            </h3>
                            <p className="text-[10px] text-gray-600 mt-1">Keep it going!</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Followed Plan Rate */}
                <div className="col-span-12 lg:col-span-4">
                    <Card className="relative overflow-hidden group border-0 shadow-xl h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none group-hover:border-[#ccf381]/20 transition-colors duration-300" />

                        <CardContent className="p-6 relative z-10 flex flex-col justify-center h-full">
                            <div className="w-12 h-12 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-6 h-6 text-[#ccf381]" />
                            </div>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Plan Adherence</p>
                            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ccf381]">
                                {stats.followedPlanRate.toFixed(0)}%
                            </h3>
                            <p className="text-[10px] text-gray-600 mt-1">Trading plan compliance</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Row 2: Entry List (8) + Form (4) — Bento */}
            <div className="grid grid-cols-12 gap-6">
                {/* Journal Entries */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="relative border-0 shadow-2xl overflow-hidden h-full">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />

                        <div className="relative z-10 p-6 border-b border-white/5">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#ccf381] rounded-full inline-block" />
                                Recent Entries
                            </h2>
                        </div>
                        <div className="relative z-10 p-6">
                            <JournalList entries={entries} />
                        </div>
                    </Card>
                </div>

                {/* New Entry Form */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="sticky top-6">
                        <Card className="relative border-0 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />

                            <div className="relative z-10 p-6 border-b border-white/5">
                                <h2 className="text-white font-bold flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#ccf381] rounded-full inline-block" />
                                    New Entry
                                </h2>
                            </div>
                            <div className="relative z-10 p-6">
                                <JournalForm />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

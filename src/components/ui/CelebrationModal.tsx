'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Trophy, X, Target } from 'lucide-react'

export function CelebrationModal({ dailyTarget, netToday, isQuestActive, dict }: { dailyTarget: number, netToday: number, isQuestActive: boolean, dict: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const prevNetToday = useRef(netToday)

    useEffect(() => {
        if (!isQuestActive || dailyTarget <= 0) return

        const todayStr = new Date().toISOString().split('T')[0]
        const storedDate = localStorage.getItem('tj_celebrated_date')

        // 1. New Day Reset
        if (storedDate !== todayStr) {
            localStorage.setItem('tj_celebrated_date', todayStr)

            // If we somehow start a new day already above target, celebrate
            if (netToday >= dailyTarget) {
                setIsOpen(true)
                const timer = setTimeout(() => setIsOpen(false), 7000)
                // Sync the ref
                prevNetToday.current = netToday
                return () => clearTimeout(timer)
            }

            // Sync the ref
            prevNetToday.current = netToday
            return
        }

        // 2. Same Day Logic: Check for a crossover using purely internal React state
        // This avoids race conditions with localStorage during rapid Next.js Server Action re-renders
        const isCurrentlyAbove = netToday >= dailyTarget
        const wasPreviouslyBelow = prevNetToday.current < dailyTarget

        if (isCurrentlyAbove && wasPreviouslyBelow) {
            setIsOpen(true)
            const timer = setTimeout(() => setIsOpen(false), 7000)

            prevNetToday.current = netToday
            return () => clearTimeout(timer)
        }

        // 3. Keep tracking the profit locally per-session so rapid toggles evaluate properly
        prevNetToday.current = netToday

    }, [dailyTarget, netToday, isQuestActive])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                        className="relative w-full max-w-sm bg-[#151515] border border-[#ccf381]/30 rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#ccf381]/20 rounded-full blur-2xl" />

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                                className="w-20 h-20 bg-gradient-to-tr from-[#ccf381] to-[#a3d149] rounded-2xl flex items-center justify-center text-black mb-6 shadow-[0_0_30px_rgba(204,243,129,0.3)]"
                            >
                                <Trophy className="w-10 h-10" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2"
                            >
                                {dict.dashboard?.goalHitTitle || "TARGET REACHED!"}
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-400 text-sm mb-6"
                            >
                                {dict.dashboard?.goalHitDesc || "ยินดีด้วย คุณได้ทำกำไรตามเป้าต่อวันแล้ว! 🎉"}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-[#0d0d0d] border border-white/5 rounded-xl p-4 w-full flex justify-between items-center"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                                        <Target className="w-3 h-3" /> Target
                                    </p>
                                    <p className="font-mono text-sm">${dailyTarget.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-[#ccf381] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 justify-end">
                                        <Sparkles className="w-3 h-3" /> Achieved
                                    </p>
                                    <p className="font-mono text-lg font-bold text-[#ccf381]">${netToday.toFixed(2)}</p>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                onClick={() => setIsOpen(false)}
                                className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                            >
                                {dict.dashboard?.goalHitBtn || "สุดยอดไปเลย"}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

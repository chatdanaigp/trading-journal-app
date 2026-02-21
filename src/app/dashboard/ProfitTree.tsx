'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { GoalSettings } from './GoalSettings'
import { useState, useEffect } from 'react'

export function ProfitTree({
    netProfit,
    portSize,
    goalPercent,
    dict
}: {
    netProfit: number,
    portSize: number,
    goalPercent: number,
    dict?: any
}) {
    // 1. Calculate Target
    const targetProfit = (portSize * goalPercent) / 100
    // 2. Calculate Progress %
    const safeNetProfit = isNaN(netProfit) ? 0 : netProfit
    const safeTarget = targetProfit <= 0 ? 1 : targetProfit // Avoid division by zero

    const progress = Math.max(0, Math.min(100, (safeNetProfit / safeTarget) * 100))
    const rawProgress = (safeNetProfit / safeTarget) * 100

    // 3. Determine Tree Stage
    let treeImage = "/images/tree/level_1.jpg"
    let stageName = "Seed Phase"
    let headerColor = "text-[#ccf381]"
    let scale = 1

    if (rawProgress > 100) {
        treeImage = "/images/tree/level_5.jpg" // Overachiever
        stageName = "Abundance"
        scale = 1.1
    } else if (rawProgress >= 75) {
        treeImage = "/images/tree/level_4.jpg" // Goal Met
        stageName = "Prosperity"
        scale = 1.05
    } else if (rawProgress >= 50) {
        treeImage = "/images/tree/level_3.jpg" // Halfway
        stageName = "Growth"
        scale = 1.0
    } else if (rawProgress >= 25) {
        treeImage = "/images/tree/level_2.jpg" // Quarter
        stageName = "Sprouting"
        scale = 1.0
    } else {
        treeImage = "/images/tree/level_1.jpg" // Start
        stageName = "Germination"
        scale = 1.0
    }

    // 4. Aura Particles (Client-side only to avoid hydration mismatch)
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <Card className="bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] border border-[#252525] shadow-xl relative overflow-hidden h-full min-h-[500px] rounded-2xl group">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccf381] blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />

            {/* Tree Image Layer (Absolute Background) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: scale, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full h-full"
                    >
                        <Image
                            src={treeImage}
                            alt={stageName}
                            fill
                            className="object-cover drop-shadow-2xl"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </motion.div>

                    {/* Glow effect centered behind tree */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#ccf381] blur-[100px] opacity-10 rounded-full -z-10" />
                </div>
            </div>

            {/* Aura Particles (Moved to be ON TOP of the image) */}
            {mounted && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
                    {[...Array(25)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-[#ccf381]"
                            initial={{
                                opacity: 0,
                                scale: 0,
                                x: Math.random() * 400 - 200,
                                y: 100
                            }}
                            animate={{
                                opacity: [0, 0.8, 0], // Much more visible
                                scale: [0, 2.5, 0],   // Larger growth
                                y: -400               // Higher float
                            }}
                            transition={{
                                duration: Math.random() * 4 + 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 3
                            }}
                            style={{
                                left: '50%',
                                top: '60%',
                                width: Math.random() * 10 + 4, // Larger base size (4-14px)
                                height: Math.random() * 10 + 4,
                                filter: 'blur(2px)', // Less blur to keep it distinct
                                boxShadow: '0 0 20px 2px #ccf381', // Strong glow
                                mixBlendMode: 'screen' // Additive blending for "light" effect
                            }}
                        />
                    ))}
                </div>
            )}

            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10 pointer-events-none">
                {/* Header (Pointer events auto for interactivity) */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{dict?.dashboard?.myForest || "My Forest"}</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 drop-shadow-md">{dict?.dashboard?.goalTarget || "Goal Target"}:</span>
                            <span className="text-sm font-bold text-[#ccf381] drop-shadow-md">${targetProfit.toLocaleString()}</span>
                        </div>
                    </div>
                    <GoalSettings initialPortSize={portSize} initialGoalPercent={goalPercent} />
                </div>

                {/* Middle Spacer */}
                <div className="flex-1" />

                {/* Stage Name & Footer */}
                <div className="space-y-6 pointer-events-auto">
                    <motion.h3
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`text-center text-3xl font-black tracking-widest uppercase mb-2 ${headerColor} drop-shadow-lg`}
                    >
                        {stageName}
                    </motion.h3>

                    {/* Progress Stats */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{dict?.dashboard?.currentProfit || "Current Profit"}</p>
                                <p className="text-2xl font-bold text-white">${netProfit.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-[#ccf381]">{rawProgress.toFixed(1)}%</p>
                            </div>
                        </div>
                        {/* Bar */}
                        <div className="h-2 w-full bg-[#333] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#ccf381] shadow-[0_0_10px_#ccf381]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

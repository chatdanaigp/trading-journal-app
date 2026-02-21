'use client'

import { useState } from 'react'
import { analyzeTrade } from './actions'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

export function AIAnalysis({ tradeId, initialAnalysis }: { tradeId: string, initialAnalysis: string | null }) {
    const [isLoading, setIsLoading] = useState(false)
    const [analysis, setAnalysis] = useState(initialAnalysis)
    const [isExpanded, setIsExpanded] = useState(false)

    const handleAnalyze = async () => {
        setIsLoading(true)
        // Artificial delay for "thinking" effect
        await new Promise(resolve => setTimeout(resolve, 1500))

        const result = await analyzeTrade(tradeId)
        if (result.success) {
            window.location.reload()
        }
        setIsLoading(false)
    }

    if (analysis) {
        return (
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "p-2.5 bg-gradient-to-br from-[#1a1a1a] to-[#252525] backdrop-blur-md border border-white/5 rounded-lg text-[11px] text-gray-300 shadow-md group cursor-pointer hover:bg-[#2a2a2a] transition-all duration-300 custom-scrollbar",
                    isExpanded
                        ? "w-[350px] h-auto max-h-[150px] absolute right-5 top-1/2 -translate-y-1/2 z-50 overflow-y-auto shadow-2xl"
                        : "w-[150px] h-[60px] relative z-0"
                )}
            >
                <div className={cn("relative z-10 leading-snug", !isExpanded && "line-clamp-3")}>
                    {analysis}
                </div>
            </div>
        )
    }

    return (
        <div>
            <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-full border-white/10 bg-gradient-to-r from-[#1a1a1a] to-[#252525] text-gray-400 hover:text-[#ccf381] hover:border-[#ccf381]/30 transition-all duration-300 shadow-lg relative group overflow-hidden whitespace-nowrap text-xs"
            >
                <div className="absolute inset-0 bg-[#ccf381]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative flex items-center justify-center">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            AI is analyzing market structure...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4 text-[#ccf381]" />
                            Analyze this trade with AI
                        </>
                    )}
                </div>
            </Button>
        </div>
    )
}

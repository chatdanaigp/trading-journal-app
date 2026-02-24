'use client'

import { useState } from 'react'
import { analyzeTrade } from './actions'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, ChevronLeft } from 'lucide-react'
import { cn } from '@/utils/cn'

export function AIAnalysis({ tradeId, initialAnalysis, isExpanded: externalExpanded, onToggle }: { tradeId: string, initialAnalysis: string | null, isExpanded?: boolean, onToggle?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [analysis, setAnalysis] = useState(initialAnalysis)
    const [internalExpanded, setInternalExpanded] = useState(false)

    const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded
    const handleToggle = () => onToggle ? onToggle() : setInternalExpanded(!internalExpanded)

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
            <div className="relative w-[150px] md:w-full h-[60px] md:h-auto flex items-center md:items-start">
                <div
                    onClick={handleToggle}
                    className={cn(
                        "p-2.5 bg-gradient-to-br from-[#1a1a1a] to-[#252525] backdrop-blur-md border border-white/5 rounded-lg text-[11px] md:text-xs text-gray-300 group transition-all duration-300 custom-scrollbar absolute md:relative right-0 md:right-auto top-1/2 md:top-auto -translate-y-1/2 md:translate-y-0",
                        isExpanded
                            ? "w-[260px] md:w-full min-h-[60px] max-h-[200px] md:max-h-none z-50 md:z-10 overflow-y-auto shadow-2xl md:shadow-sm"
                            : "w-[150px] md:w-full min-h-[60px] md:min-h-0 max-h-[60px] md:max-h-none overflow-hidden z-10 shadow-md md:shadow-sm"
                    )}
                >
                    <div className="w-full h-full relative z-10 flex flex-col justify-center md:justify-start cursor-pointer md:cursor-auto">
                        <div className={cn("leading-snug", !isExpanded && "line-clamp-2 md:line-clamp-none pr-4 md:pr-0")}>
                            {analysis}
                        </div>
                        {!isExpanded && (
                            <div className="absolute md:hidden right-0 top-1/2 -translate-y-1/2 text-[#ccf381]/40 group-hover:text-[#ccf381] group-hover:-translate-x-1 transition-all duration-300">
                                <ChevronLeft size={14} />
                            </div>
                        )}
                    </div>
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

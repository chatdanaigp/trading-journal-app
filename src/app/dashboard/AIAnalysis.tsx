'use client'

import { useState } from 'react'
import { analyzeTrade } from './actions'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

export function AIAnalysis({ tradeId, initialAnalysis }: { tradeId: string, initialAnalysis: string | null }) {
    const [isLoading, setIsLoading] = useState(false)
    const [analysis, setAnalysis] = useState(initialAnalysis)

    const handleAnalyze = async () => {
        setIsLoading(true)
        // Artificial delay for "thinking" effect
        await new Promise(resolve => setTimeout(resolve, 1500))

        const result = await analyzeTrade(tradeId)
        if (result.success) {
            // Trigger a page refresh or just optimistic update? 
            // Since we revalidatePath in action, ensuring we get fresh data might need a router refresh.
            // But for now, we can rely on the revalidatePath effectively reloading the server component data if we refresh.
            // Actually, client component won't auto-update from server action reval without router.refresh().
            // Let's just create a quick optimistic update or reload.
            window.location.reload()
        }
        setIsLoading(false)
    }

    if (analysis) {
        return (
            <div className="p-2.5 bg-gradient-to-br from-[#252525]/80 to-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-lg text-[11px] text-gray-300 shadow-md relative group max-w-xs cursor-default hover:bg-[#2a2a2a] transition-colors">
                <div className="relative z-10 leading-snug line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
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

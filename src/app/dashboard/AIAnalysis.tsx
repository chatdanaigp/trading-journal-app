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
            <div className="mt-6 p-4 bg-gradient-to-br from-[#252525]/80 to-[#1a1a1a]/80 backdrop-blur-md border border-white/5 rounded-xl text-sm text-gray-300 shadow-xl relative overflow-hidden group">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#ccf381]/5 blur-xl -mr-10 -mt-10 pointer-events-none" />

                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-[#2a2a2a] border-t border-l border-white/10 rotate-45 z-10" />
                <div className="relative z-10 leading-relaxed">
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

'use client'

import { useEffect, useState } from 'react'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/utils/cn'

export function TopNavigation({ className, showDate = true }: { className?: string; showDate?: boolean }) {
    const [clientId, setClientId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchClientId() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('client_id')
                    .eq('id', user.id)
                    .single()

                if (profile?.client_id) {
                    setClientId(profile.client_id)
                }
            }
        }
        fetchClientId()
    }, [])

    return (
        <div className={cn("flex flex-wrap items-center justify-end gap-2 sm:gap-3", className)}>
            {showDate && (
                <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 hidden xs:block">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
            )}

            {clientId && (
                <div className="bg-[#ccf381]/10 border border-[#ccf381]/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm text-[#ccf381] font-mono font-semibold flex items-center gap-1.5 sm:gap-2 h-9">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    </svg>
                    <span className="hidden xs:inline">Connext ID:</span> {clientId}
                </div>
            )}

            <LanguageToggle />
        </div>
    )
}

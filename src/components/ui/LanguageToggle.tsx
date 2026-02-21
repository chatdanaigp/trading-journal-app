'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'

export function LanguageToggle() {
    const [lang, setLang] = useState<'EN' | 'TH'>('EN')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('tj_language') as 'EN' | 'TH'
        if (saved) {
            setLang(saved)
        }
    }, [])

    const toggleLang = (newLang: 'EN' | 'TH') => {
        setLang(newLang)
        localStorage.setItem('tj_language', newLang)
        // Use a slight delay before reload to allow state update to render
        setTimeout(() => {
            window.location.reload()
        }, 150)
    }

    // Avoid hydration mismatch by not rendering the specific language until mounted
    if (!mounted) {
        return (
            <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded-full p-0.5 pointer-events-none opacity-50">
                <div className="px-3 py-1 text-xs font-bold text-transparent">EN</div>
            </div>
        )
    }

    return (
        <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded-full p-0.5">
            <button
                onClick={() => toggleLang('EN')}
                className={cn(
                    "px-3 py-1 text-xs font-bold rounded-full transition-all duration-300",
                    lang === 'EN' ? "bg-[#333] text-white shadow-md" : "text-gray-500 hover:text-white"
                )}
            >
                ENG
            </button>
            <button
                onClick={() => toggleLang('TH')}
                className={cn(
                    "px-3 py-1 text-xs font-bold rounded-full transition-all duration-300",
                    lang === 'TH' ? "bg-[#333] text-white shadow-md" : "text-gray-500 hover:text-white"
                )}
            >
                TH
            </button>
        </div>
    )
}

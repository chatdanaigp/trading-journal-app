'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { Label } from './label'
import type { Dictionary } from '@/utils/dictionaries'

export function StrategyDropdown({
    value,
    onChange,
    options,
    dict
}: {
    value: string
    onChange: (val: string) => void
    options: string[]
    dict?: Dictionary
}) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Handle clicking outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative w-full" ref={containerRef}>
            <Label className="text-gray-400 text-xs mb-2 block flex items-center gap-1.5">
                <Sparkles size={10} className="text-[#ccf381]" />
                # {dict?.tradeForm?.strategy || 'Strategy'}
            </Label>
            
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full h-11 px-4 flex items-center justify-between bg-[#0d0d0d] border transition-all duration-300 rounded-xl group ${
                    open ? 'border-[#ccf381]/50 ring-1 ring-[#ccf381]/20' : 'border-[#333] hover:border-[#444]'
                }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {value ? (
                        <span className="text-sm font-bold text-[#ccf381] truncate">#{value}</span>
                    ) : (
                        <span className="text-sm text-gray-600 truncate">{dict?.tradeForm?.selectStrategy || 'Select Strategy...'}</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 shrink-0 ${open ? 'rotate-180 text-[#ccf381]' : 'group-hover:text-gray-400'}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <LazyMotion features={domAnimation}>
                        <m.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute z-[100] w-full mt-2 bg-[#151515] border border-[#333] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md"
                        >
                            <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1.5 grid grid-cols-1 gap-1">
                                {options.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            onChange(tag)
                                            setOpen(false)
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-lg transition-all duration-200 ${
                                            value === tag
                                                ? 'bg-[#ccf381]/10 text-[#ccf381] font-bold'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span className="truncate">#{tag}</span>
                                        {value === tag && <Check className="w-3.5 h-3.5 text-[#ccf381] shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </m.div>
                    </LazyMotion>
                )}
            </AnimatePresence>
            <input type="hidden" name="strategy" value={value} />
        </div>
    )
}

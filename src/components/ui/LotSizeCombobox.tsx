'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { animate, motion, AnimatePresence } from 'framer-motion'

export function LotSizeCombobox({
    value,
    onChange,
    dict
}: {
    value: string
    onChange: (val: string) => void
    dict?: any
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    // Generate Array of lots: 0.01 - 10.00
    const lotOptions = useMemo(() => {
        const options = []
        for (let i = 1; i <= 1000; i++) {
            options.push((i / 100).toFixed(2))
        }
        return options
    }, [])

    // Filter lots based on search
    const filteredOptions = useMemo(() => {
        if (!search) return lotOptions
        return lotOptions.filter((lot) => lot.includes(search))
    }, [search, lotOptions])

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
        <div className="relative" ref={containerRef}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    name="lotSize"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value)
                        setSearch(e.target.value) // Also update search when typing so dropdown filters
                        if (!open) setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="0.01"
                    className="w-full h-11 pl-3 pr-10 bg-[#0d0d0d] border border-[#333] focus:border-[#ccf381]/50 focus:ring-1 focus:ring-[#ccf381]/50 text-white placeholder-gray-700 rounded-xl outline-none font-mono transition-all"
                    autoComplete="off"
                    required
                />

                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-500 hover:text-[#ccf381] transition-colors"
                    tabIndex={-1}
                >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180 text-[#ccf381]' : ''}`} />
                </button>
            </div>

            {/* The Dropdown Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 bg-[#151515] border border-[#333] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Search Input (Now functioning purely as a filter if people want to use it instead of typing in main input) */}
                        <div className="flex items-center px-3 py-2 border-b border-[#333] bg-[#0d0d0d]/50">
                            <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                            <input
                                type="text"
                                placeholder={dict?.tradeForm?.searchLot || "Filter list..."}
                                className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none font-mono"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()} // Prevent closing when typing
                            />
                        </div>

                        {/* Options List */}
                        <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((lot) => (
                                    <button
                                        key={lot}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            onChange(lot)
                                            setOpen(false)
                                            setSearch('')
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg font-mono transition-colors ${value === lot
                                            ? 'bg-[#ccf381]/10 text-[#ccf381] font-bold'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {lot}
                                        {value === lot && <Check className="w-4 h-4 text-[#ccf381]" />}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    {dict?.tradeForm?.noResults || "No matching sizes."}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

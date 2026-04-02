import React, { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { dictionaries } from '@/utils/dictionaries'

type AppDictionary = typeof dictionaries.EN

export type FilterState = {
    symbol: string
    type: string | 'BUY' | 'SELL'
    result: string | 'win' | 'loss' | 'be'
    strategy: string
}

interface TradeFiltersProps {
    dict?: AppDictionary
    onFilterChange: (filters: FilterState) => void
    initialFilters?: FilterState
    className?: string
}

export function TradeFilters({ dict, onFilterChange, initialFilters, className }: TradeFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters || {
        symbol: '',
        type: '',
        result: '',
        strategy: ''
    })

    const [isExpanded, setIsExpanded] = useState(false)

    // Debounce the text inputs like symbol and strategy
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange(filters)
        }, 400)
        return () => clearTimeout(timer)
    }, [filters, onFilterChange])

    const handleClear = () => {
        const cleared = { symbol: '', type: '', result: '', strategy: '' }
        setFilters(cleared)
        onFilterChange(cleared)
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== '')

    return (
        <div className={cn("p-4 bg-[#1a1a1a] border border-[#333] rounded-xl flex flex-col gap-4 transition-all", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#ccf381]" />
                    <span className="font-bold text-sm text-gray-200">Filters</span>
                    {hasActiveFilters && (
                        <span className="bg-[#ccf381]/20 text-[#ccf381] text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
                            Active
                        </span>
                    )}
                </div>
                
                <div className="flex gap-2">
                    {hasActiveFilters && (
                        <button onClick={handleClear} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs md:hidden text-white bg-white/10 px-3 py-1 rounded-lg"
                    >
                        {isExpanded ? 'Hide' : 'Show'} Filters
                    </button>
                </div>
            </div>

            <div className={cn("gap-4 md:flex", isExpanded ? "flex flex-col" : "hidden")}>
                {/* Search Asset */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Asset (e.g. XAUUSD)"
                        value={filters.symbol}
                        onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ccf381]/50 focus:ring-1 focus:ring-[#ccf381]/50 transition-all uppercase"
                    />
                </div>

                {/* Search Strategy */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold text-sm">#</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Strategy Name"
                        value={filters.strategy}
                        onChange={(e) => setFilters({ ...filters, strategy: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ccf381]/50 focus:ring-1 focus:ring-[#ccf381]/50 transition-all"
                    />
                </div>

                {/* Side Dropdown */}
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="bg-black/30 w-full md:w-32 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#ccf381]/50 focus:ring-1 focus:ring-[#ccf381]/50 transition-all cursor-pointer"
                >
                    <option value="">All Sides</option>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                </select>

                {/* Result Dropdown */}
                <select
                    value={filters.result}
                    onChange={(e) => setFilters({ ...filters, result: e.target.value })}
                    className="bg-black/30 w-full md:w-32 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#ccf381]/50 focus:ring-1 focus:ring-[#ccf381]/50 transition-all cursor-pointer"
                >
                    <option value="">All Results</option>
                    <option value="win">Won</option>
                    <option value="loss">Lost</option>
                    <option value="be">Break Even</option>
                </select>
            </div>
        </div>
    )
}

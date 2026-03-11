'use client'

import { useState, useEffect, useRef } from 'react'
import { Briefcase, Plus, ChevronDown, X } from 'lucide-react'
import useSWR, { mutate as globalMutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface PortfolioSelectorProps {
    value: string | null
    onChange: (portfolioId: string | null) => void
    dict?: any
}

export function PortfolioSelector({ value, onChange, dict }: PortfolioSelectorProps) {
    const { data: portfolios = [] } = useSWR('/api/portfolios', fetcher)
    const [isOpen, setIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setIsCreating(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selectedName = value
        ? (portfolios.find((p: any) => p.id === value)?.name || 'Portfolio')
        : (dict?.portfolio?.allTrades || 'All Trades')

    async function handleCreate() {
        if (!newName.trim()) return
        await fetch('/api/portfolios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim() })
        })
        setNewName('')
        setIsCreating(false)
        globalMutate('/api/portfolios')
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#1a1a1a] border border-[#333] text-gray-400 hover:border-[#ccf381]/40 hover:text-[#ccf381] transition-all"
            >
                <Briefcase size={13} />
                <span className="max-w-[100px] truncate">{selectedName}</span>
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* All Trades */}
                    <button
                        onClick={() => { onChange(null); setIsOpen(false) }}
                        className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center gap-2 transition-colors ${
                            !value ? 'bg-[#ccf381]/10 text-[#ccf381]' : 'text-gray-400 hover:bg-[#252525]'
                        }`}
                    >
                        <Briefcase size={12} />
                        {dict?.portfolio?.allTrades || 'All Trades'}
                    </button>

                    {/* Portfolios */}
                    {portfolios.map((p: any) => (
                        <button
                            key={p.id}
                            onClick={() => { onChange(p.id); setIsOpen(false) }}
                            className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center gap-2 transition-colors border-t border-white/5 ${
                                value === p.id ? 'bg-[#ccf381]/10 text-[#ccf381]' : 'text-gray-400 hover:bg-[#252525]'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                            <span className="truncate">{p.name}</span>
                        </button>
                    ))}

                    {/* Create New */}
                    <div className="border-t border-white/5">
                        {isCreating ? (
                            <div className="p-2 flex gap-1.5">
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    placeholder="Portfolio name..."
                                    className="flex-1 text-xs bg-[#0d0d0d] border border-[#333] rounded-lg px-2 py-1.5 text-white placeholder:text-gray-700 focus:border-[#ccf381] outline-none"
                                />
                                <button onClick={handleCreate} className="p-1.5 rounded-lg bg-[#ccf381]/15 text-[#ccf381] hover:bg-[#ccf381]/25 transition-colors">
                                    <Plus size={12} />
                                </button>
                                <button onClick={() => setIsCreating(false)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full px-3 py-2.5 text-left text-xs font-bold text-gray-600 hover:text-[#ccf381] hover:bg-[#252525] transition-colors flex items-center gap-2"
                            >
                                <Plus size={12} />
                                {dict?.portfolio?.create || 'New Portfolio'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

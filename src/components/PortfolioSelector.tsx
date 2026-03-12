'use client'

import { useState, useEffect, useRef } from 'react'
import { Briefcase, Plus, ChevronDown, X, Trash2 } from 'lucide-react'
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
                setNewName('')
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

    async function handleDelete(id: string) {
        if (!confirm(dict?.portfolio?.deleteConfirm || 'Delete this portfolio? Trades will move to All Trades.')) return
        await fetch(`/api/portfolios?id=${id}`, { method: 'DELETE' })
        if (value === id) onChange(null)
        globalMutate('/api/portfolios')
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { setIsOpen(!isOpen); setIsCreating(false); setNewName('') }}
                className="flex items-center gap-1.5 px-3 py-2 h-9 text-xs font-bold rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 hover:border-purple-400/50 transition-all whitespace-nowrap"
            >
                <Briefcase size={13} />
                <span className="max-w-[120px] truncate">{selectedName}</span>
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-white/5">
                        <p className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">{dict?.portfolio?.selectPortfolio || 'Select Portfolio'}</p>
                    </div>

                    {/* All Trades */}
                    <button
                        onClick={() => { onChange(null); setIsOpen(false) }}
                        className={`w-full px-3 py-3 text-left text-xs font-bold flex items-center gap-2.5 transition-colors ${
                            !value ? 'bg-[#ccf381]/10 text-[#ccf381]' : 'text-gray-400 hover:bg-[#252525]'
                        }`}
                    >
                        <Briefcase size={14} />
                        {dict?.portfolio?.allTrades || 'All Trades'}
                        {!value && <span className="ml-auto text-[9px] bg-[#ccf381]/20 text-[#ccf381] px-1.5 py-0.5 rounded-md font-bold">Active</span>}
                    </button>

                    {/* Portfolios list */}
                    {portfolios.map((p: any) => (
                        <button
                            key={p.id}
                            onClick={() => { onChange(p.id); setIsOpen(false) }}
                            className={`w-full px-3 py-3 text-left text-xs font-bold flex items-center gap-2.5 transition-colors border-t border-white/5 group ${
                                value === p.id ? 'bg-[#ccf381]/10 text-[#ccf381]' : 'text-gray-400 hover:bg-[#252525]'
                            }`}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="truncate flex-1">{p.name}</span>
                            {value === p.id && <span className="text-[9px] bg-[#ccf381]/20 text-[#ccf381] px-1.5 py-0.5 rounded-md font-bold">Active</span>}
                            <span
                                onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}
                                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all cursor-pointer p-0.5"
                            >
                                <Trash2 size={11} />
                            </span>
                        </button>
                    ))}

                    {/* Create New */}
                    <div className="border-t border-white/10 bg-[#111]">
                        {isCreating ? (
                            <div className="p-2.5 flex gap-2">
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setIsCreating(false); setNewName('') } }}
                                    placeholder={dict?.portfolio?.namePlaceholder || 'Portfolio name...'}
                                    className="flex-1 text-xs bg-[#0d0d0d] border border-[#333] rounded-lg px-2.5 py-2 text-white placeholder:text-gray-700 focus:border-[#ccf381] outline-none"
                                />
                                <button onClick={handleCreate} className="px-2.5 py-2 rounded-lg bg-[#ccf381] text-black text-[10px] font-bold hover:bg-[#bbe075] transition-colors">
                                    Add
                                </button>
                                <button onClick={() => { setIsCreating(false); setNewName('') }} className="px-2 py-2 rounded-lg bg-[#252525] text-gray-500 hover:text-red-400 transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full px-3 py-3 text-left text-xs font-bold text-gray-500 hover:text-[#ccf381] hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
                            >
                                <Plus size={14} />
                                {dict?.portfolio?.create || 'New Portfolio'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

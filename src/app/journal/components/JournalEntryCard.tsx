'use client'

import { useState } from 'react'
import { JournalEntry } from '../actions'
import { deleteJournalEntry } from '../actions'
import { Trash2, ChevronDown, ChevronUp, CheckCircle, XCircle, Calendar } from 'lucide-react'

const MOOD_EMOJI: Record<string, string> = {
    great: '🔥',
    good: '😊',
    neutral: '😐',
    bad: '😔',
    terrible: '💀',
}

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
    const [expanded, setExpanded] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this entry?')) return
        setDeleting(true)
        await deleteJournalEntry(entry.id)
        setDeleting(false)
    }

    const dateFormatted = new Date(entry.trading_day).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })

    return (
        <div className="bg-[#151515] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
            {/* Header — Always Visible */}
            <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Mood */}
                <div className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#1a1a1a] rounded-xl border border-white/5">
                    {entry.mood ? MOOD_EMOJI[entry.mood] || '📝' : '📝'}
                </div>

                {/* Title & Date */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{entry.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-600" />
                        <span className="text-[11px] text-gray-500">{dateFormatted}</span>
                    </div>
                </div>

                {/* Plan Status */}
                <div className="flex-shrink-0">
                    {entry.followed_plan ? (
                        <div className="flex items-center gap-1 text-[10px] text-[#ccf381] bg-[#ccf381]/5 border border-[#ccf381]/20 rounded-lg px-2 py-1">
                            <CheckCircle className="w-3 h-3" />
                            <span className="font-bold">Plan</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-2 py-1">
                            <XCircle className="w-3 h-3" />
                            <span className="font-bold">Off Plan</span>
                        </div>
                    )}
                </div>

                {/* Expand Toggle */}
                <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-white/5 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {/* Content */}
                    {entry.content && (
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                        </p>
                    )}

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {entry.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-[#ccf381]/5 text-[#ccf381]/70 border border-[#ccf381]/10 font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

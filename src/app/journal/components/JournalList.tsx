'use client'

import { JournalEntry } from '../actions'
import { JournalEntryCard } from './JournalEntryCard'
import { BookOpen } from 'lucide-react'

export function JournalList({ entries }: { entries: JournalEntry[] }) {
    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-6 bg-[#1a1a1a] rounded-full mb-4 border border-white/5">
                    <BookOpen className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 font-bold">No journal entries yet</p>
                <p className="text-sm text-gray-600 mt-1">Start writing to track your mindset!</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {entries.map(entry => (
                <JournalEntryCard key={entry.id} entry={entry} />
            ))}
        </div>
    )
}

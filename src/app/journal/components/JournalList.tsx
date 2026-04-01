'use client'

import { JournalEntry } from '../actions'
import { JournalEntryCard } from './JournalEntryCard'
import { BookOpen } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Dictionary } from '@/utils/dictionaries'

export function JournalList({ entries, dict }: { entries: JournalEntry[], dict: Dictionary }) {
    if (entries.length === 0) {
        return (
            <EmptyState
                icon={BookOpen}
                title={dict.journal.noEntries}
                subtitle={dict.journal.startWriting}
            />
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

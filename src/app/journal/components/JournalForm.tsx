'use client'

import { useState, useRef } from 'react'
import { createJournalEntry } from '../actions'
import { motion } from 'framer-motion'
import { useSWRConfig } from 'swr'

const MOOD_OPTIONS = [
    { value: 'great', emoji: '🔥', label: 'Great' },
    { value: 'good', emoji: '😊', label: 'Good' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'bad', emoji: '😔', label: 'Bad' },
    { value: 'terrible', emoji: '💀', label: 'Terrible' },
]

const TAG_PRESETS = [
    'Followed Plan', 'FOMO', 'Revenge Trade', 'Overtraded',
    'Patience', 'Discipline', 'News Event', 'Technical Setup',
    'Early Exit', 'Late Entry', 'Perfect Execution',
]

export function JournalForm({ dict }: { dict: any }) {
    const [loading, setLoading] = useState(false)
    const [selectedMood, setSelectedMood] = useState<string>('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [followedPlan, setFollowedPlan] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const { mutate } = useSWRConfig()

    function toggleTag(tag: string) {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage(null)

        formData.set('mood', selectedMood)
        formData.set('tags', selectedTags.join(','))
        formData.set('followedPlan', followedPlan.toString())

        const result = await createJournalEntry(formData)

        if (result.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            // Globally refresh all SWR cached API routes (dashboard, journal, analytics, etc)
            mutate((key: any) => typeof key === 'string' && key.startsWith('/api/'))

            setMessage({ type: 'success', text: 'Entry saved!' })
            formRef.current?.reset()
            setSelectedMood('')
            setSelectedTags([])
            setFollowedPlan(true)
            setTimeout(() => setMessage(null), 3000)
        }
        setLoading(false)
    }

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5 block">Title</label>
                <input
                    name="title"
                    required
                    placeholder="e.g. Monday Trading Session"
                    className="w-full bg-[#151515] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#ccf381]/30 transition-colors"
                />
            </div>

            {/* Trading Day */}
            <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5 block">Trading Day</label>
                <input
                    name="tradingDay"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#151515] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ccf381]/30 transition-colors"
                />
            </div>

            {/* Mood */}
            <div>
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">{dict.journalForm.howFeel}</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {MOOD_OPTIONS.map((m) => (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                key={m.value}
                                type="button"
                                onClick={() => setSelectedMood(m.value)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors ${selectedMood === m.value
                                    ? 'bg-[#ccf381]/15 border-[#ccf381]/40 text-[#ccf381] shadow-[0_0_15px_rgba(204,243,129,0.1)]'
                                    : 'bg-[#151515] border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300 hover:bg-[#1a1a1a]'
                                    }`}
                            >
                                <motion.span
                                    animate={{ scale: selectedMood === m.value ? 1.2 : 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="text-2xl mb-1 origin-bottom"
                                >
                                    {m.emoji}
                                </motion.span>
                                <span className={`text-xs font-medium ${selectedMood === m.value ? 'text-[#ccf381]' : ''}`}>{dict.journalForm[m.value]}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div>
                <label className="text-sm font-medium text-gray-300">{dict.journalForm.notes}</label>
                <textarea
                    name="content"
                    rows={4}
                    placeholder={dict.journalForm.notesPlaceholder}
                    className="w-full bg-[#151515] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#ccf381]/30 transition-colors resize-none"
                />
            </div>

            {/* Followed Plan */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1a1a1a] border border-[#333]">
                <div className="flex-1">
                    <p className="text-sm font-medium text-white">{dict.journalForm.followedPlanTitle}</p>
                    <p className="text-xs text-gray-500">{dict.journalForm.followedPlanSub}</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        type="button"
                        onClick={() => setFollowedPlan(true)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border ${followedPlan
                            ? 'bg-[#ccf381]/15 border-[#ccf381]/40 text-[#ccf381] shadow-[0_0_15px_rgba(204,243,129,0.1)]'
                            : 'bg-[#151515] border-white/5 text-gray-500 hover:border-white/10 hover:bg-[#1a1a1a]'
                            }`}
                    >
                        ✅ {dict.journalForm.yes}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        type="button"
                        onClick={() => setFollowedPlan(false)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border ${!followedPlan
                            ? 'bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                            : 'bg-[#151515] border-white/5 text-gray-500 hover:border-white/10 hover:bg-[#1a1a1a]'
                            }`}
                    >
                        ❌ {dict.journalForm.no}
                    </motion.button>
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">{dict.journalForm.tagsLabel}</label>
                <div className="flex flex-wrap gap-2">
                    {TAG_PRESETS.map(tag => (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedTags.includes(tag)
                                ? 'bg-[#ccf381]/15 border-[#ccf381]/40 text-[#ccf381] shadow-[0_0_10px_rgba(204,243,129,0.1)]'
                                : 'bg-[#151515] border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300 hover:bg-[#1a1a1a]'
                                }`}
                        >
                            #{dict.journalForm.tagOptions[tag.replace(/\s/g, '')]}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#ccf381] text-black font-bold text-sm hover:bg-[#d4f78e] transition-colors disabled:opacity-50 shadow-lg shadow-[#ccf381]/10"
            >
                {loading ? 'Saving...' : '📝 Save Journal Entry'}
            </motion.button>

            {/* Status Message */}
            {message && (
                <div className={`text-sm text-center py-2 rounded-xl ${message.type === 'success' ? 'text-[#ccf381] bg-[#ccf381]/5' : 'text-red-400 bg-red-500/5'
                    }`}>
                    {message.text}
                </div>
            )}
        </form>
    )
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type JournalEntry = {
    id: string
    user_id: string
    title: string
    content: string | null
    mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | null
    tags: string[]
    trading_day: string
    followed_plan: boolean
    created_at: string
    updated_at: string
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('trading_day', { ascending: false })

    if (error) {
        console.error('Error fetching journal entries:', error)
        return []
    }

    return data || []
}

export async function createJournalEntry(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const mood = formData.get('mood') as string
    const tagsRaw = formData.get('tags') as string
    const tradingDay = formData.get('tradingDay') as string
    const followedPlan = formData.get('followedPlan') === 'true'

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

    const { error } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        title,
        content: content || null,
        mood: mood || null,
        tags,
        trading_day: tradingDay || new Date().toISOString().split('T')[0],
        followed_plan: followedPlan,
    })

    if (error) {
        console.error('Supabase Error:', error)
        return { error: error.message }
    }

    revalidatePath('/journal')
    return { success: true }
}

export async function updateJournalEntry(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const entryId = formData.get('entryId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const mood = formData.get('mood') as string
    const tagsRaw = formData.get('tags') as string
    const tradingDay = formData.get('tradingDay') as string
    const followedPlan = formData.get('followedPlan') === 'true'

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

    const { error } = await supabase
        .from('journal_entries')
        .update({
            title,
            content: content || null,
            mood: mood || null,
            tags,
            trading_day: tradingDay,
            followed_plan: followedPlan,
            updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Supabase Error:', error)
        return { error: error.message }
    }

    revalidatePath('/journal')
    return { success: true }
}

export async function deleteJournalEntry(entryId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Supabase Error:', error)
        return { error: error.message }
    }

    revalidatePath('/journal')
    return { success: true }
}

export async function getJournalStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { totalEntries: 0, followedPlanRate: 0, streakDays: 0 }

    const { data, error } = await supabase
        .from('journal_entries')
        .select('trading_day, followed_plan')
        .eq('user_id', user.id)
        .order('trading_day', { ascending: false })

    if (error || !data) return { totalEntries: 0, followedPlanRate: 0, streakDays: 0 }

    const totalEntries = data.length
    const followedCount = data.filter(e => e.followed_plan).length
    const followedPlanRate = totalEntries > 0 ? (followedCount / totalEntries) * 100 : 0

    // Calculate streak
    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < data.length; i++) {
        const entryDate = new Date(data[i].trading_day)
        entryDate.setHours(0, 0, 0, 0)
        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)

        if (entryDate.getTime() === expectedDate.getTime()) {
            streakDays++
        } else {
            break
        }
    }

    return { totalEntries, followedPlanRate, streakDays }
}

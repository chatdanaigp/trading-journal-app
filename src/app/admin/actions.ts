'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Security: Check if user is an authorized admin
export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    // Method 1: Check environment variable for admin user IDs
    const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || []
    if (adminIds.length > 0 && adminIds.includes(user.id)) return true

    // Method 2: Fallback to profile username check
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

    return profile?.username === 'admin'
}

// Get all users with their profiles and trade stats
export async function getAllUsers() {
    const supabase = await createClient()

    if (!(await isAdmin())) return []

    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })

    if (profileError) {
        console.error('Error fetching profiles:', profileError)
        return []
    }

    // For each profile, get their trade count and total profit
    const usersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
            const { data: trades } = await supabase
                .from('trades')
                .select('profit')
                .eq('user_id', profile.id)

            const totalTrades = trades?.length || 0
            const totalProfit = trades?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0
            const wins = trades?.filter(t => (t.profit || 0) > 0).length || 0
            const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

            return {
                ...profile,
                totalTrades,
                totalProfit,
                winRate,
            }
        })
    )

    return usersWithStats
}

// Update a user's profile
export async function updateUserProfile(userId: string, data: {
    username?: string
    full_name?: string
    port_size?: number
    profit_goal_percent?: number
}) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Delete a user's trades (we can't delete auth users with anon key, but we can clean their data)
export async function deleteUserTrades(userId: string) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', userId)

    if (error) {
        console.error('Error deleting trades:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Delete a user's journal entries
export async function deleteUserJournalEntries(userId: string) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('user_id', userId)

    if (error) {
        console.error('Error deleting journal entries:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Delete user profile (removes profile, triggering cascade of related data)
export async function deleteUserProfile(userId: string) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    // Delete trades first
    await supabase.from('trades').delete().eq('user_id', userId)
    // Delete journal entries
    await supabase.from('journal_entries').delete().eq('user_id', userId)
    // Delete profile
    const { error } = await supabase.from('profiles').delete().eq('id', userId)

    if (error) {
        console.error('Error deleting profile:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

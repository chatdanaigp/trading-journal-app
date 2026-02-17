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

// Get all users with their trade stats via SECURITY DEFINER function
export async function getAllUsers() {
    const supabase = await createClient()

    if (!(await isAdmin())) return []

    const { data, error } = await supabase.rpc('admin_get_all_users')

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return (data || []).map((u: any) => ({
        id: u.user_id,
        username: u.username,
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        port_size: u.port_size,
        profit_goal_percent: u.profit_goal_percent,
        totalTrades: Number(u.total_trades) || 0,
        totalProfit: Number(u.total_profit) || 0,
        winRate: Number(u.win_rate) || 0,
    }))
}

// Update a user's profile via SECURITY DEFINER function
export async function updateUserProfile(userId: string, data: {
    username?: string
    full_name?: string
    port_size?: number
    profit_goal_percent?: number
}) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    const { data: result, error } = await supabase.rpc('admin_update_profile', {
        target_user_id: userId,
        new_username: data.username || null,
        new_full_name: data.full_name || null,
        new_port_size: data.port_size || null,
        new_goal_percent: data.profit_goal_percent || null,
    })

    if (error) {
        console.error('Error updating profile:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Delete a user's trades via SECURITY DEFINER function
export async function deleteUserTrades(userId: string) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    const { data: result, error } = await supabase.rpc('admin_delete_user_trades', {
        target_user_id: userId,
    })

    if (error) {
        console.error('Error deleting trades:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Delete a user's journal entries via SECURITY DEFINER function
export async function deleteUserJournalEntries(userId: string) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    const { data: result, error } = await supabase.rpc('admin_delete_user_journal', {
        target_user_id: userId,
    })

    if (error) {
        console.error('Error deleting journal entries:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

// Delete user entirely (trades + journal + profile) via SECURITY DEFINER function
export async function deleteUserProfile(userId: string) {
    const supabase = await createClient()

    if (!(await isAdmin())) return { error: 'Unauthorized' }

    const { data: result, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
    })

    if (error) {
        console.error('Error deleting user:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

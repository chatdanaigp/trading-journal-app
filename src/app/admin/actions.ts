'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTradingDayStr } from '@/utils/date-helpers'

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

    // Fetch all profiles and trades from the Admin RPCs that just return raw rows
    // Since we cannot run complex timezone logic reliably in raw PG safely without service keys or DB changes,
    // we fetch raw data and aggregate it here using our strict getTradingDayStr logic.
    
    // We already have `get_all_trades_admin` which returns all trades.
    const [{ data: profiles }, { data: allTrades }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.rpc('get_all_trades_admin')
    ]);

    if (!profiles) return [];
    
    const trades = allTrades || [];

    return profiles.map((u: any) => {
        const userTrades = trades.filter((t: any) => t.user_id === u.id)
        const totalTrades = userTrades.length
        
        // Calculate Win Rate strictly based on profit > 0
        const winCount = userTrades.filter((t: any) => (Number(t.profit) || 0) > 0).length
        const lossCount = userTrades.filter((t: any) => (Number(t.profit) || 0) < 0).length
        const classifiedTrades = winCount + lossCount;
        const winRate = classifiedTrades > 0 ? (winCount / classifiedTrades) * 100 : 0;
        
        // Total Profit
        const totalProfit = userTrades.reduce((sum: number, t: any) => sum + (Number(t.profit) || 0), 0)

        return {
            id: u.id,
            username: u.username,
            full_name: u.full_name,
            avatar_url: u.avatar_url,
            port_size: u.port_size,
            profit_goal_percent: u.profit_goal_percent,
            client_id: u.client_id,
            totalTrades,
            totalProfit,
            winRate,
        }
    })
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

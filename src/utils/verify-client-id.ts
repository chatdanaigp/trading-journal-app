import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server-side check: ensures the current user has a verified client_id.
 * Admin users (username = 'admin') are exempt.
 * If not verified, redirects to /verify.
 * Returns the user and clientId if verified.
 */
export async function requireVerifiedUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile with client_id and username
    const { data: profile } = await supabase
        .from('profiles')
        .select('client_id, username')
        .eq('id', user.id)
        .single()

    // Admin users are exempt from client_id check
    const isAdmin = profile?.username === 'admin'

    if (!isAdmin && (!profile || !profile.client_id)) {
        console.log('[VERIFY CHECK] User', user.id, 'has no client_id, redirecting to /verify')
        redirect('/verify')
    }

    return { user, clientId: profile?.client_id || null, isAdmin }
}

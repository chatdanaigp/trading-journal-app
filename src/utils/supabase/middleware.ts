import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that don't require client_id verification
const EXEMPT_PATHS = ['/login', '/auth', '/adminlogin', '/admin', '/api', '/verify']

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Redirect unauthenticated users trying to access dashboard
    if (pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user needs client_id verification
    if (user && !EXEMPT_PATHS.some(path => pathname.startsWith(path))) {
        // Check if user has a client_id in their profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('client_id, username')
            .eq('id', user.id)
            .single()

        // Admin users (username = 'admin') are exempt from client_id check
        const isAdmin = profile?.username === 'admin'

        if (!isAdmin && (!profile || !profile.client_id)) {
            return NextResponse.redirect(new URL('/verify', request.url))
        }
    }

    return supabaseResponse
}

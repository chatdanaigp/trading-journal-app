import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Check if user has client_id to determine redirect
            const { data: { user } } = await supabase.auth.getUser()
            let redirectTo = '/verify' // Default: send to verification

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('client_id, username')
                    .eq('id', user.id)
                    .single()

                const isAdmin = profile?.username === 'admin'

                if (isAdmin || profile?.client_id) {
                    redirectTo = searchParams.get('next') ?? '/dashboard'
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${redirectTo}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`)
            } else {
                return NextResponse.redirect(`${origin}${redirectTo}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

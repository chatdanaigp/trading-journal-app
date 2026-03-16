import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' })

    const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    return NextResponse.json({ trades })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const GOOGLE_SHEET_ID = '1Z3CjITQdDE6JnF6EXjjuYadX5ahf4D0r1LxrDFoFT-k'
const SHEET_GID = '1347127933'

async function fetchClientIdsFromSheet(): Promise<string[]> {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}&range=A4:A1000`

    const response = await fetch(url, { next: { revalidate: 300 } }) // Cache for 5 minutes

    if (!response.ok) {
        console.error('Failed to fetch Google Sheet:', response.status)
        throw new Error('Failed to fetch client IDs from Google Sheet')
    }

    const csv = await response.text()

    // Parse CSV - each line is a quoted value like "78619"
    const clientIds = csv
        .split('\n')
        .map(line => line.replace(/"/g, '').trim())
        .filter(id => id.length > 0 && /^\d+$/.test(id))

    return clientIds
}

export async function POST(request: Request) {
    try {
        const { clientId } = await request.json()

        if (!clientId || typeof clientId !== 'string') {
            return NextResponse.json(
                { error: 'กรุณากรอก Client ID' },
                { status: 400 }
            )
        }

        // Validate format: must be 5 digits
        if (!/^\d{5}$/.test(clientId.trim())) {
            return NextResponse.json(
                { error: 'Client ID ต้องเป็นตัวเลข 5 หลักเท่านั้น' },
                { status: 400 }
            )
        }

        const trimmedId = clientId.trim()

        // Fetch valid client IDs from Google Sheet
        const validClientIds = await fetchClientIdsFromSheet()

        // Check if the client ID exists in the sheet
        if (!validClientIds.includes(trimmedId)) {
            return NextResponse.json(
                { error: 'ไม่พบ Client ID นี้ในระบบ ConnextFX กรุณาตรวจสอบอีกครั้ง' },
                { status: 404 }
            )
        }

        // Save the client ID to the user's profile
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'กรุณาเข้าสู่ระบบก่อน' },
                { status: 401 }
            )
        }

        // Check if this client ID is already used by another user
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('client_id', trimmedId)
            .neq('id', user.id)
            .single()

        if (existingProfile) {
            return NextResponse.json(
                { error: 'Client ID นี้ถูกใช้งานแล้วโดยบัญชีอื่น' },
                { status: 409 }
            )
        }

        // Update the user's profile with the client ID
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ client_id: trimmedId })
            .eq('id', user.id)

        if (updateError) {
            console.error('Error updating profile:', updateError)
            return NextResponse.json(
                { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, message: 'ยืนยัน Client ID สำเร็จ!' })

    } catch (error) {
        console.error('Verify client ID error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        )
    }
}

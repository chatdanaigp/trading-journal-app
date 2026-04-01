import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

const FOLDER_ID = '1YzE6DVO6pfbpt0fuFTNRnjFnUSr5MgM-'

type GoogleServiceAccountCredentials = {
    client_email: string
    private_key: string
    [key: string]: string
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Upload failed'
}

function getAuth() {
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!credentials) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set')
    }

    const parsed = JSON.parse(credentials) as GoogleServiceAccountCredentials
    
    return new google.auth.GoogleAuth({
        credentials: parsed,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    })
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const userId = formData.get('userId') as string

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create readable stream from buffer
        const stream = new Readable()
        stream.push(buffer)
        stream.push(null)

        const auth = getAuth()
        const drive = google.drive({ version: 'v3', auth })

        // Upload file to Google Drive
        const fileName = `trade_${userId || 'unknown'}_${Date.now()}.${file.name.split('.').pop() || 'png'}`
        
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [FOLDER_ID],
            },
            media: {
                mimeType: file.type || 'image/png',
                body: stream,
            },
            fields: 'id, webViewLink, webContentLink',
        })

        const fileId = response.data.id

        if (!fileId) {
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
        }

        // Make the file publicly viewable
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        })

        // Get the direct view URL
        const viewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
        const webViewUrl = response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`

        return NextResponse.json({
            success: true,
            url: viewUrl,
            webViewUrl: webViewUrl,
            fileId: fileId,
        })
    } catch (error: unknown) {
        console.error('Google Drive upload error:', error)
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

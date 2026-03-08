import 'server-only'
import { cookies } from 'next/headers'
import type { Language } from './dictionaries'

export async function getCurrentLanguage(): Promise<Language> {
    const cookieStore = await cookies()
    const tjsLang = cookieStore.get('tj_language')?.value as Language
    return tjsLang === 'TH' ? 'TH' : 'EN'
}

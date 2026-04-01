'use client'

import { useState } from 'react'
import { dictionaries, type Dictionary, type Language } from '@/utils/dictionaries'

function getLanguageFromCookie(): Language {
    const language = document.cookie.match(/tj_language=(\w+)/)?.[1]
    return language === 'TH' ? 'TH' : 'EN'
}

export function useClientDictionary() {
    const [dict] = useState<Dictionary>(() => dictionaries[typeof document === 'undefined' ? 'EN' : getLanguageFromCookie()])
    return dict
}

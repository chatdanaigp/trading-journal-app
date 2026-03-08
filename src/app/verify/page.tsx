import { getDictionary } from '@/utils/dictionaries'
import { getCurrentLanguage } from '@/utils/dictionaries-server'
import VerifyClient from './VerifyClient'

export default async function VerifyPage() {
    const lang = await getCurrentLanguage()
    const dict = await getDictionary(lang)

    return <VerifyClient dict={dict} />
}

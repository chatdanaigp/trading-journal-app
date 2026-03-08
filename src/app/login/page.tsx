import { getDictionary } from '@/utils/dictionaries'
import { getCurrentLanguage } from '@/utils/dictionaries-server'
import LoginClient from './LoginClient'

export default async function LoginPage() {
    const lang = await getCurrentLanguage()
    const dict = await getDictionary(lang)

    return <LoginClient dict={dict} />
}

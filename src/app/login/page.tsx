import { getCurrentLanguage, getDictionary } from '@/utils/dictionaries'
import LoginClient from './LoginClient'

export default async function LoginPage() {
    const lang = await getCurrentLanguage()
    const dict = await getDictionary(lang)

    return <LoginClient dict={dict} />
}

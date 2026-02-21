import { getCurrentLanguage, getDictionary } from '@/utils/dictionaries'
import AdminLoginClient from './AdminLoginClient'

export default async function AdminLoginPage() {
    const lang = await getCurrentLanguage()
    const dict = await getDictionary(lang)

    return <AdminLoginClient dict={dict} />
}

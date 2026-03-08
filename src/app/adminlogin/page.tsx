import { getDictionary } from '@/utils/dictionaries'
import { getCurrentLanguage } from '@/utils/dictionaries-server'
import AdminLoginClient from './AdminLoginClient'

export default async function AdminLoginPage() {
    const lang = await getCurrentLanguage()
    const dict = await getDictionary(lang)

    return <AdminLoginClient dict={dict} />
}

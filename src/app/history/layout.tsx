import { Sidebar } from '@/components/Sidebar'
import { getDictionary } from '@/utils/dictionaries'
import { getCurrentLanguage } from '@/utils/dictionaries-server'

export default async function HistoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const lang = await getCurrentLanguage()
    const dict = getDictionary(lang)

    return (
        <div className="min-h-screen bg-[#050505] flex font-sans selection:bg-[#ccf381] selection:text-black">
            <Sidebar dict={dict} />
            <main className="flex min-h-screen flex-1 flex-col overflow-y-auto bg-[#050505] p-4 pt-16 text-gray-200 lg:ml-64 lg:p-8 lg:pt-8">
                <div className="mx-auto flex h-full min-h-full w-full max-w-[1600px] flex-col">
                    {children}
                </div>
            </main>
        </div>
    )
}

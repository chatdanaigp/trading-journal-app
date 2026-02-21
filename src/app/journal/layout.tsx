import { Sidebar } from '@/components/Sidebar'
import { getCurrentLanguage, getDictionary } from '@/utils/dictionaries'

export default async function JournalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const lang = await getCurrentLanguage()
    const dict = getDictionary(lang)

    return (
        <div className="min-h-screen bg-[#050505] flex font-sans selection:bg-[#ccf381] selection:text-black">
            <Sidebar dict={dict} />
            <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8 overflow-y-auto min-h-screen bg-[#050505] text-gray-200">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

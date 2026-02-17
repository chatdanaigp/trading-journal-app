import { Sidebar } from '@/components/Sidebar'

export default function JournalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#050505] flex font-sans selection:bg-[#ccf381] selection:text-black">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-[#050505] text-gray-200">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

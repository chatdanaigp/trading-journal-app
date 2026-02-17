import { Sidebar } from '@/components/Sidebar'

export default function LeaderboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#050505] flex font-sans selection:bg-[#ccf381] selection:text-black">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8 overflow-y-auto min-h-screen bg-[#050505] text-gray-200">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

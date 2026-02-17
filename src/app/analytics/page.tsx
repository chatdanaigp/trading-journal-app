import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from './actions'
import { KPIGrid } from './components/KPIGrid'
import { AnalyticsCharts } from './components/AnalyticsCharts'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Analytics Data
    const data = await getAnalyticsData()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
                    <p className="text-gray-500">Deep dive into your trading performance.</p>
                </div>

                <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400">
                    All Time View
                </div>
            </div>

            {/* Row 1: Hero KPIs (Bento 4 + 8 split) */}
            <KPIGrid stats={data.stats} />

            {/* Row 2+: Charts (Bento layout) */}
            <AnalyticsCharts data={data} />
        </div>
    )
}

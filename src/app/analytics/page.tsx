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

                {/* Date Range Picker Placeholder - Could be implemented later */}
                <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400">
                    All Time View
                </div>
            </div>

            {/* KPI Grid */}
            <KPIGrid stats={data.stats} />

            {/* Visualizations */}
            <AnalyticsCharts data={data} />
        </div>
    )
}

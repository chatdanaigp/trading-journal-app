import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from './actions'
import { KPIGrid } from './components/KPIGrid'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { requireVerifiedUser } from '@/utils/verify-client-id'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'

export default async function AnalyticsPage() {
    // Server-side check: redirects to /verify if user has no client_id
    const { user } = await requireVerifiedUser()

    // Fetch Analytics Data
    const data = await getAnalyticsData()

    return (
        <StaggerContainer className="space-y-8">
            {/* Header */}
            <StaggerItem>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
                        <p className="text-gray-500">Deep dive into your trading performance.</p>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400">
                        All Time View
                    </div>
                </div>
            </StaggerItem>

            {/* Row 1: Hero KPIs (Bento 4 + 8 split) */}
            <StaggerItem>
                <KPIGrid stats={data.stats} />
            </StaggerItem>

            {/* Row 2+: Charts (Bento layout) */}
            <StaggerItem>
                <AnalyticsCharts data={data} />
            </StaggerItem>
        </StaggerContainer>
    )
}

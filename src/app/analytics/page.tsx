import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from './actions'
import { KPIGrid } from './components/KPIGrid'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { requireVerifiedUser } from '@/utils/verify-client-id'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { getCurrentLanguage, getDictionary } from '@/utils/dictionaries'

export default async function AnalyticsPage() {
    // Server-side check: redirects to /verify if user has no client_id
    const { user } = await requireVerifiedUser()

    // Fetch Analytics Data
    const data = await getAnalyticsData()
    const lang = await getCurrentLanguage()
    const dict = getDictionary(lang)

    return (
        <StaggerContainer className="space-y-8">
            {/* Header */}
            <StaggerItem>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{dict.analytics.title}</h1>
                        <p className="text-gray-500">{dict.analytics.subtitle}</p>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400">
                        {dict.analytics.allTimeView}
                    </div>
                </div>
            </StaggerItem>

            {/* Row 1: Hero KPIs (Bento 4 + 8 split) */}
            <StaggerItem>
                <KPIGrid stats={data.stats} dict={dict} />
            </StaggerItem>

            {/* Row 2+: Charts (Bento layout) */}
            <StaggerItem>
                <AnalyticsCharts data={data} dict={dict} />
            </StaggerItem>
        </StaggerContainer>
    )
}

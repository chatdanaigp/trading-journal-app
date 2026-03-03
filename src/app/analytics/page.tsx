import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsData } from './actions'
import { KPIGrid } from './components/KPIGrid'
import { AnalyticsCharts } from './components/AnalyticsCharts'
import { requireVerifiedUser } from '@/utils/verify-client-id'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { getCurrentLanguage, getDictionary } from '@/utils/dictionaries'
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { TopNavigation } from '@/components/TopNavigation'

export default async function AnalyticsPage() {
    // Server-side check: redirects to /verify if user has no client_id
    const { user } = await requireVerifiedUser()

    // Time Boundaries
    const now = new Date()
    const monthStart = startOfMonth(now).toISOString()
    const monthEnd = endOfMonth(now).toISOString()
    const yearStart = startOfYear(now).toISOString()
    const yearEnd = endOfYear(now).toISOString()

    // Fetch Analytics Data (Dual Scope)
    const [monthlyData, yearlyData] = await Promise.all([
        getAnalyticsData(monthStart, monthEnd),
        getAnalyticsData(yearStart, yearEnd)
    ])

    const lang = await getCurrentLanguage()
    const dict = await getDictionary(lang)

    return (
        <div className="space-y-8">
            <TopNavigation />

            <StaggerContainer className="space-y-8">
                <StaggerItem>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{(dict as any)?.analytics?.monthlyTitle || 'Monthly Analytics'} ({now.toLocaleString('default', { month: 'long' })})</h1>
                            <p className="text-gray-500">{(dict as any)?.analytics?.monthlySubtitle || 'Performance for the current month'}</p>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-[#ccf381] font-bold shadow-[0_0_10px_rgba(204,243,129,0.1)]">
                            Month-To-Date (MTD)
                        </div>
                    </div>
                </StaggerItem>

                {/* Monthly Hero KPIs */}
                <StaggerItem>
                    <KPIGrid stats={monthlyData.stats} dict={dict} />
                </StaggerItem>

                {/* Monthly Charts */}
                <StaggerItem>
                    <AnalyticsCharts data={monthlyData} dict={dict} />
                </StaggerItem>

                {/* Yearly Section Header */}
                <StaggerItem className="pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{(dict as any)?.analytics?.yearlyTitle || 'Yearly Overview'} ({now.getFullYear()})</h1>
                            <p className="text-gray-500">{(dict as any)?.analytics?.yearlySubtitle || 'Comprehensive performance for the current year'}</p>
                        </div>
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-sm text-gray-400 font-bold">
                            Year-To-Date (YTD)
                        </div>
                    </div>
                </StaggerItem>

                {/* Yearly Hero KPIs */}
                <StaggerItem>
                    <KPIGrid stats={yearlyData.stats} dict={dict} />
                </StaggerItem>

                {/* Yearly Charts */}
                <StaggerItem>
                    <AnalyticsCharts data={yearlyData} dict={dict} />
                </StaggerItem>
            </StaggerContainer>
        </div>
    )
}

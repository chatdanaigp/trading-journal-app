'use client'

import useSWR from 'swr'
import type { AnalyticsPageData, ChallengeApiResponse, DashboardPageData, HistoryApiResponse, JournalApiResponse, LeaderboardApiResponse } from '@/types/models'

const fetcher = async <T>(url: string): Promise<T> => fetch(url).then(res => {
    if (!res.ok) throw new Error('API error')
    return res.json() as Promise<T>
})

const swrConfig = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    keepPreviousData: true,
}

export function useDashboardData(month?: number, year?: number, portfolioId?: string | null) {
    const params = new URLSearchParams()
    if (month !== undefined) params.set('month', month.toString())
    if (year !== undefined) params.set('year', year.toString())
    if (portfolioId) params.set('portfolio_id', portfolioId)
    const query = params.toString()

    return useSWR<DashboardPageData>(
        `/api/dashboard${query ? `?${query}` : ''}`,
        fetcher,
        swrConfig
    )
}

export function useAnalyticsData() {
    return useSWR<AnalyticsPageData>('/api/analytics', fetcher, swrConfig)
}

export function useJournalData() {
    return useSWR<JournalApiResponse>('/api/journal', fetcher, swrConfig)
}

export function useLeaderboardData() {
    return useSWR<LeaderboardApiResponse>('/api/leaderboard', fetcher, swrConfig)
}

export function useChallengeData() {
    return useSWR<ChallengeApiResponse>('/api/challenge', fetcher, swrConfig)
}

export function useHistoryData(month?: number, year?: number) {
    const params = new URLSearchParams()
    if (month !== undefined) params.set('month', month.toString())
    if (year !== undefined) params.set('year', year.toString())
    const query = params.toString()

    return useSWR<HistoryApiResponse>(
        `/api/history${query ? `?${query}` : ''}`,
        fetcher,
        swrConfig
    )
}

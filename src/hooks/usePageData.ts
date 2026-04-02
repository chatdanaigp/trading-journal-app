'use client'

import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import type { FilterState } from '@/components/ui/TradeFilters'
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

export function useHistoryDataInfinite(month?: number, year?: number, filters?: FilterState) {
    const getKey = (pageIndex: number, previousPageData: HistoryApiResponse | null) => {
        if (previousPageData && (!previousPageData.trades || previousPageData.trades.length === 0)) return null
        if (previousPageData && previousPageData.page >= previousPageData.totalPages) return null
        
        const params = new URLSearchParams()
        if (month !== undefined) params.set('month', month.toString())
        if (year !== undefined) params.set('year', year.toString())
        
        params.set('page', (pageIndex + 1).toString())
        params.set('limit', '50')
        
        if (filters?.symbol) params.set('symbol', filters.symbol)
        if (filters?.type) params.set('type', filters.type)
        if (filters?.result) params.set('result', filters.result)
        if (filters?.strategy) params.set('strategy', filters.strategy)
        
        const query = params.toString()
        return `/api/history${query ? `?${query}` : ''}`
    }

    return useSWRInfinite<HistoryApiResponse>(getKey, fetcher, swrConfig)
}


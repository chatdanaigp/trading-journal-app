'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('API error')
    return res.json()
})

const swrConfig = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    keepPreviousData: true,
}

export function useDashboardData(month?: number, year?: number) {
    const params = new URLSearchParams()
    if (month !== undefined) params.set('month', month.toString())
    if (year !== undefined) params.set('year', year.toString())
    const query = params.toString()

    return useSWR(
        `/api/dashboard${query ? `?${query}` : ''}`,
        fetcher,
        swrConfig
    )
}

export function useAnalyticsData() {
    return useSWR('/api/analytics', fetcher, swrConfig)
}

export function useJournalData() {
    return useSWR('/api/journal', fetcher, swrConfig)
}

export function useLeaderboardData() {
    return useSWR('/api/leaderboard', fetcher, swrConfig)
}

export function useChallengeData() {
    return useSWR('/api/challenge', fetcher, swrConfig)
}

export function useHistoryData() {
    return useSWR('/api/history', fetcher, swrConfig)
}

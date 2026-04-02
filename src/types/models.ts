import type { JournalEntry } from '@/app/journal/actions'
import type { AnalyticsData } from '@/app/analytics/actions'

export type CalendarImpact = 'high' | 'medium' | 'low'

export type CalendarEvent = {
    date: string
    time: string
    timezone: string
    title: string
    currency: string
    impact: CalendarImpact
    isToday: boolean
    forecast: string | null
    previous: string | null
    analysis: string
    isHoliday: boolean
}

export type CalendarApiResponse = {
    date?: string
    events: CalendarEvent[]
    error?: string
}

export type JournalStats = {
    totalEntries: number
    followedPlanRate: number
    streakDays: number
}

export type JournalApiResponse = {
    entries: JournalEntry[]
    stats: JournalStats
}

export type LeaderboardEntry = {
    out_user_id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    total_trades: number
    win_rate: number
    net_profit: number
    avg_trade: number
    best_trade: number
    current_streak: number
}

export type LeaderboardApiResponse = {
    leaderboard: LeaderboardEntry[]
    currentUserId: string
}

export type TradeRecord = {
    id: string
    created_at: string
    type: string | null
    symbol: string | null
    strategy?: string | null
    profit: number | null
    lot_size: number | null
    portfolio_id: string | null
}

/**
 * Full trade row as stored in the database.
 * Extends TradeRecord with all optional columns.
 */
export type FullTradeRecord = TradeRecord & {
    user_id: string
    entry_price: number | null
    exit_price: number | null
    stop_loss: number | null
    take_profit: number | null
    screenshot_url: string | null
    notes: string | null
}

/**
 * User profile row from the profiles table.
 */
export type ProfileRecord = {
    id: string
    username: string | null
    avatar_url: string | null
    bio: string | null
    port_size: number | null
    profit_goal_percent: number | null
    is_portfolio_quest_active: boolean
    commission_per_lot: number | null
    currency: string | null
}

export type PortfolioRecord = {
    id: string
    user_id?: string
    name: string
    description?: string | null
    created_at?: string
}

export type ImportedTradeRecord = {
    user_id: string
    symbol: string
    type: 'BUY' | 'SELL'
    lot_size: number
    entry_price: number
    exit_price: number | null
    profit: number
    created_at: string
    stop_loss: number | null
    take_profit: number | null
    strategy?: string | null
    notes: string
}

export type ChallengeQuest = {
    completed: boolean
}

export type ChallengeApiResponse = {
    goals: {
        port_size: number
        profit_goal_percent: number
        is_portfolio_quest_active: boolean
    }
    trades: TradeRecord[]
    quests: ChallengeQuest[]
    dailyProfit: number
    portSize: number
    goalPercent: number
    isQuestActive: boolean
}

export type HistoryTradeRecord = TradeRecord & {
    entry_price: number | null
    exit_price: number | null
    stop_loss: number | null
    take_profit: number | null
    screenshot_url: string | null
    notes: string | null
    net_profit: number
    commission_applied: number
}

export type HistoryApiResponse = {
    trades: HistoryTradeRecord[]
    totalCount: number
    page: number
    totalPages: number
    username: string
}

export type PublicProfileResponse = {
    profile: {
        username: string
        avatar_url: string | null
        bio: string | null
    }
    stats: {
        totalTrades: number
        winRate: number
        profitFactor: number
        maxWinStreak: number
        maxLossStreak: number
        winCount: number
        lossCount: number
    }
    equityCurve: Array<{
        date: string
        percent: number
    }>
    strategies: Array<{
        name: string
        count: number
        winRate: number
    }>
}

export type AnalyticsPageData = {
    monthlyData: AnalyticsData
    yearlyData: AnalyticsData
}

export type DashboardStats = {
    totalTrades: number
    winRate: string
    netProfit: string
    profitFactor: string
    averageWin: string
    averageLoss: string
    totalLots: string
    longStats: {
        count: number
        winRate: string
        profit: string
    }
    shortStats: {
        count: number
        winRate: string
        profit: string
    }
}

export type DashboardGoals = {
    port_size: number
    profit_goal_percent: number
    is_portfolio_quest_active: boolean
    currency: string
}

export type DashboardPageData = {
    trades: HistoryTradeRecord[]
    allTrades: HistoryTradeRecord[]
    stats: DashboardStats
    goals: DashboardGoals
    username: string
    points: {
        monthlyPoints: number
        weeklyPoints: number
        dailyPoints: number
        dailyProfit: number
    }
    dailyTargetAmount: number
    isQuestActive: boolean
    portSize: number
    goalPercent: number
    commissionPerLot: number
}

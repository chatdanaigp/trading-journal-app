import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin, getAllUsers } from './actions'
import { UserCard } from './components/UserCard'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, ShieldAlert, Users, BarChart3, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/adminlogin')
    }

    // Secure admin check
    const authorized = await isAdmin()

    if (!authorized) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
                <div className="text-center space-y-4 max-w-md mx-auto p-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-red-400">Access Denied</h1>
                    <p className="text-gray-500">You do not have permission to access the admin panel.</p>
                    <p className="text-xs text-gray-600 bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
                        If you believe this is an error, contact your administrator to add your User ID to the <code className="text-[#ccf381]">ADMIN_USER_IDS</code> environment variable.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 text-[#ccf381] text-sm font-bold hover:bg-[#ccf381]/20 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Fetch data
    const users = await getAllUsers()

    // Fetch ALL trades
    const { data: trades, error: tradesError } = await supabase.rpc('get_all_trades_admin')
    if (tradesError) {
        console.error('Error fetching trades:', tradesError)
    }

    const totalUsers = users.length
    const totalTrades = trades?.length || 0
    const totalProfit = users.reduce((sum: number, u: { totalProfit: number }) => sum + u.totalProfit, 0)

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#ccf381] blur-[150px] opacity-5 rounded-full pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-[200px] h-[200px] bg-red-500 blur-[150px] opacity-5 rounded-full pointer-events-none" />

            <div className="max-w-[1400px] mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center shadow-lg shadow-[#ccf381]/5">
                            <Shield className="w-6 h-6 text-[#ccf381]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Admin <span className="text-[#ccf381]">Panel</span>
                            </h1>
                            <p className="text-gray-500 text-sm">Manage users and monitor platform activity</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/5 text-sm text-gray-400 hover:text-white hover:border-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-4">
                        <Card className="relative overflow-hidden group border-0 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                            <CardContent className="p-6 relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Users</p>
                                    <h3 className="text-3xl font-bold text-white">{totalUsers}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <Card className="relative overflow-hidden group border-0 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                            <CardContent className="p-6 relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Trades</p>
                                    <h3 className="text-3xl font-bold text-white">{totalTrades}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <Card className="relative overflow-hidden group border-0 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a2a2a] via-[#1a1a1a] to-[#050505] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />
                            <CardContent className="p-6 relative z-10 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totalProfit >= 0 ? 'bg-[#ccf381]/10 border border-[#ccf381]/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                    <span className="text-xl font-bold">{totalProfit >= 0 ? '💰' : '📉'}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Platform P&L</p>
                                    <h3 className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                        {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* User Management */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1 h-6 bg-[#ccf381] rounded-full inline-block" />
                        <h2 className="text-xl font-bold text-white">User Management</h2>
                        <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full border border-white/5 ml-2">{totalUsers} users</span>
                    </div>
                    <div className="space-y-3">
                        {users.map((user: any) => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                </div>

                {/* Trade Activity */}
                {trades && trades.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
                            <h2 className="text-xl font-bold text-white">Recent Trades</h2>
                            <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded-full border border-white/5 ml-2">{totalTrades} trades</span>
                        </div>
                        <Card className="relative overflow-hidden border-0 shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1d1d1d] via-[#0d0d0d] to-[#000000] z-0" />
                            <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none z-20" />
                            <CardContent className="relative z-10 p-0">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-wider">
                                            <th className="text-left p-4 font-medium">Trader</th>
                                            <th className="text-left p-4 font-medium">Symbol</th>
                                            <th className="text-left p-4 font-medium">Type</th>
                                            <th className="text-right p-4 font-medium">Profit</th>
                                            <th className="text-right p-4 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {trades.slice(0, 20).map((trade: any) => (
                                            <tr key={trade.trade_id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-[#ccf381]/5 border border-[#ccf381]/10 flex items-center justify-center text-[#ccf381] text-xs font-bold">
                                                            {(trade.trader_full_name || 'U')[0]}
                                                        </div>
                                                        <span className="text-white font-medium text-xs">{trade.trader_full_name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-white font-bold">{trade.symbol}</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trade.type === 'BUY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        {trade.type}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-right font-bold ${trade.profit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                                    {trade.profit ? `${trade.profit > 0 ? '+' : ''}$${trade.profit.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="p-4 text-right text-gray-500 text-xs">
                                                    {new Date(trade.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}

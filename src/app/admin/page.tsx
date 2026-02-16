import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

    if (profile?.username !== 'admin') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-red-500">403 Forbidden</h1>
                    <p className="text-gray-400">You do not have permission to view this page.</p>
                    <p className="text-sm text-gray-500">
                        (Dev Note: Go to Supabase &rarr; Table Editor &rarr; profiles &rarr; set your username to 'admin')
                    </p>
                </div>
            </div>
        )
    }

    // Fetch ALL trades from everyone using the secure RPC function
    const { data: trades, error } = await supabase.rpc('get_all_trades_admin')

    if (error) {
        console.error('Error fetching all trades:', error)
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
            <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#ccf381] blur-[150px] opacity-10 rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                <div className="flex justify-between items-end border-b border-[#333] pb-6">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                            Admin <span className="text-[#ccf381]">Nexus</span>
                        </h1>
                        <p className="text-gray-400 mt-1">Monitoring global trade activity</p>
                    </div>
                    <a href="/dashboard" className="text-sm font-bold text-[#ccf381] hover:text-[#b0d16a] transition-colors flex items-center gap-2 px-4 py-2 rounded-full border border-[#ccf381]/20 hover:bg-[#ccf381]/10">
                        ← Back to My Dashboard
                    </a>
                </div>

                <div className="grid gap-4">
                    {trades?.map((trade: any) => (
                        <Card key={trade.trade_id} className="bg-[#1a1a1a]/60 backdrop-blur-md border-[#333] hover:border-[#ccf381]/50 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(204,243,129,0.1)]">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center space-x-5">
                                    {/* User Avatar Placeholder */}
                                    <div className="h-12 w-12 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center text-[#ccf381] font-black text-lg shadow-[0_0_10px_rgba(204,243,129,0.1)]">
                                        {trade.trader_full_name?.[0] || 'U'}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-lg text-white group-hover:text-[#ccf381] transition-colors">{trade.trader_full_name || 'Unknown User'}</p>
                                            <span className="text-xs text-gray-500 bg-[#0d0d0d] px-2 py-0.5 rounded border border-[#333]">@{trade.trader_username || 'user'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                {trade.type}
                                            </span>
                                            <span className="text-sm font-bold text-gray-300">{trade.symbol}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className={`text-xl font-black ${trade.profit >= 0 ? 'text-[#ccf381] drop-shadow-[0_0_8px_rgba(204,243,129,0.3)]' : 'text-red-500'}`}>
                                        {trade.profit ? (trade.profit > 0 ? `+$${trade.profit.toLocaleString()}` : `$${trade.profit.toLocaleString()}`) : '-'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                        {new Date(trade.created_at).toLocaleDateString()} • {new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {trade.screenshot_url && (
                                        <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#ccf381] hover:underline block mt-2 hover:text-white transition-colors">
                                            📷 View Screenshot ↗
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

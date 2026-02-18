'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, Settings, LogOut, Wallet, BarChart3, HelpCircle, Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Sidebar() {
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [clientId, setClientId] = useState<string | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('client_id')
                    .eq('id', user.id)
                    .single()
                setClientId(profile?.client_id || null)
            }
        }
        getUser()
    }, [])

    // Close mobile sidebar on navigation
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    const links = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
        { name: 'Journal', href: '/journal', icon: Wallet },
    ]

    const lowerLinks = [
        { name: 'Settings', href: '#', icon: Settings },
        { name: 'Help', href: '#', icon: HelpCircle },
    ]

    const discordAvatar = user?.user_metadata?.avatar_url
    const discordName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Trader'

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all shadow-lg"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "w-64 h-screen bg-[#0d0d0d] border-r border-[#1f1f1f] flex flex-col p-6 fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300",
                mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="w-8 h-8 rounded-lg bg-[#ccf381] flex items-center justify-center text-black font-bold">
                        TJ
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">TradingJ.</h1>
                </div>

                {/* User Profile */}
                {user && (
                    <div className="mb-6 p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center gap-3">
                        {discordAvatar ? (
                            <img
                                src={discordAvatar}
                                alt={discordName}
                                className="w-10 h-10 rounded-full border-2 border-[#5865F2]"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5865F2] to-[#4752C4] border-2 border-[#5865F2] flex items-center justify-center text-white font-bold">
                                {discordName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{discordName}</p>
                            {clientId ? (
                                <p className="text-[10px] text-[#ccf381] font-mono font-semibold tracking-wider">ID: {clientId}</p>
                            ) : (
                                <p className="text-xs text-gray-500">Discord Account</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Menu Label */}
                <div className="text-xs font-bold text-gray-500 mb-4 px-2 tracking-wider">DASHBOARD</div>

                {/* Navigation */}
                <nav className="space-y-1 flex-1">
                    {links.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-[#ccf381] text-black font-semibold shadow-lg shadow-[#ccf381]/20"
                                        : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                                )}
                            >
                                <link.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-gray-400 group-hover:text-white")} />
                                <span>{link.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Lower Links */}
                <div className="border-t border-[#1f1f1f] pt-6 space-y-1">
                    <div className="text-xs font-bold text-gray-500 mb-4 px-2 tracking-wider">SETTINGS</div>
                    {lowerLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-all"
                        >
                            <link.icon className="w-5 h-5" />
                            <span>{link.name}</span>
                        </Link>
                    ))}

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            window.location.href = '/login'
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </>
    )
}

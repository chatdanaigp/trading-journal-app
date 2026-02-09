'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, Settings, LogOut, Wallet, BarChart3, HelpCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Sidebar() {
    const pathname = usePathname()

    const links = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
        { name: 'Journal', href: '#', icon: Wallet }, // Placeholder
    ]

    const lowerLinks = [
        { name: 'Settings', href: '#', icon: Settings },
        { name: 'Help', href: '#', icon: HelpCircle }, // Placeholder
    ]

    return (
        <div className="w-64 h-screen bg-[#0d0d0d] border-r border-[#1f1f1f] flex flex-col p-6 fixed left-0 top-0 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 rounded-lg bg-[#ccf381] flex items-center justify-center text-black font-bold">
                    TJ
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">TradingJ.</h1>
            </div>

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

                <form action="/auth/signout" method="post" className="w-full mt-2">
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full">
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                    </button>
                </form>
            </div>

            {/* User Profile Mini (Optional) */}
            <div className="mt-8 pt-6 border-t border-[#1f1f1f] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-gray-500" />
                <div>
                    <p className="text-sm font-bold text-white">Trader</p>
                    <p className="text-xs text-gray-500">Pro Plan</p>
                </div>
            </div>
        </div>
    )
}

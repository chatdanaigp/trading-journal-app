'use client'

import { useState } from 'react'
import { updateUserProfile, deleteUserProfile, deleteUserTrades } from '../actions'
import { Trash2, Save, ChevronDown, ChevronUp, AlertTriangle, User, BarChart3, DollarSign, Loader2 } from 'lucide-react'

type UserData = {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    port_size: number | null
    profit_goal_percent: number | null
    totalTrades: number
    totalProfit: number
    winRate: number
}

export function UserCard({ user }: { user: UserData }) {
    const [expanded, setExpanded] = useState(false)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const [username, setUsername] = useState(user.username || '')
    const [fullName, setFullName] = useState(user.full_name || '')
    const [portSize, setPortSize] = useState(user.port_size || 1000)
    const [goalPercent, setGoalPercent] = useState(user.profit_goal_percent || 10)

    async function handleSave() {
        setSaving(true)
        await updateUserProfile(user.id, {
            username: username || undefined,
            full_name: fullName || undefined,
            port_size: portSize,
            profit_goal_percent: goalPercent,
        })
        setSaving(false)
        setEditing(false)
    }

    async function handleDeleteUser() {
        setDeleting(true)
        await deleteUserProfile(user.id)
        setDeleting(false)
        setConfirmDelete(false)
    }

    async function handleDeleteTrades() {
        if (!confirm('Delete ALL trades for this user? This cannot be undone.')) return
        await deleteUserTrades(user.id)
    }

    return (
        <div className="bg-[#151515] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
            {/* Header */}
            <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name || ''} className="w-10 h-10 rounded-full border-2 border-[#5865F2]" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center text-white font-bold border-2 border-[#5865F2]">
                            {(user.full_name || user.username || 'U')[0].toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{user.full_name || 'Unknown'}</h3>
                        {user.username && (
                            <span className="text-[10px] text-gray-500 bg-[#0d0d0d] px-1.5 py-0.5 rounded border border-white/5">@{user.username}</span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-600 truncate mt-0.5">{user.id}</p>
                </div>

                {/* Quick Stats */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Trades</p>
                        <p className="text-sm font-bold text-white">{user.totalTrades}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Win Rate</p>
                        <p className={`text-sm font-bold ${user.winRate >= 50 ? 'text-[#ccf381]' : 'text-red-400'}`}>{user.winRate.toFixed(0)}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold">P&L</p>
                        <p className={`text-sm font-bold ${user.totalProfit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                            {user.totalProfit >= 0 ? '+' : ''}${user.totalProfit.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Expand */}
                <div className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-white/5 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Mobile Stats */}
                    <div className="md:hidden grid grid-cols-3 gap-3">
                        <div className="bg-[#0d0d0d] rounded-lg p-3 text-center border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Trades</p>
                            <p className="text-lg font-bold text-white">{user.totalTrades}</p>
                        </div>
                        <div className="bg-[#0d0d0d] rounded-lg p-3 text-center border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Win Rate</p>
                            <p className={`text-lg font-bold ${user.winRate >= 50 ? 'text-[#ccf381]' : 'text-red-400'}`}>{user.winRate.toFixed(0)}%</p>
                        </div>
                        <div className="bg-[#0d0d0d] rounded-lg p-3 text-center border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">P&L</p>
                            <p className={`text-lg font-bold ${user.totalProfit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>${user.totalProfit.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Edit Form */}
                    {editing ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Username</label>
                                    <input value={username} onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-[#0d0d0d] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ccf381]/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Full Name</label>
                                    <input value={fullName} onChange={e => setFullName(e.target.value)}
                                        className="w-full bg-[#0d0d0d] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ccf381]/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Port Size ($)</label>
                                    <input type="number" value={portSize} onChange={e => setPortSize(Number(e.target.value))}
                                        className="w-full bg-[#0d0d0d] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ccf381]/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Goal (%)</label>
                                    <input type="number" value={goalPercent} onChange={e => setGoalPercent(Number(e.target.value))}
                                        className="w-full bg-[#0d0d0d] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ccf381]/30" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#ccf381] text-black text-xs font-bold hover:bg-[#d4f78e] transition-all disabled:opacity-50">
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Save</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Actions */
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors">
                                <User className="w-3 h-3" /> Edit Profile
                            </button>
                            <button onClick={handleDeleteTrades}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors">
                                <BarChart3 className="w-3 h-3" /> Delete Trades
                            </button>

                            {!confirmDelete ? (
                                <button onClick={() => setConfirmDelete(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="w-3 h-3" /> Delete User
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-xs text-red-400 font-bold">Are you sure?</span>
                                    <button onClick={handleDeleteUser} disabled={deleting}
                                        className="px-2 py-0.5 rounded bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50">
                                        {deleting ? '...' : 'Yes, Delete'}
                                    </button>
                                    <button onClick={() => setConfirmDelete(false)}
                                        className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-xs hover:bg-white/20">
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

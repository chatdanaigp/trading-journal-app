'use client'

import { useState, useEffect } from 'react'
import { Shield, Globe, Eye, EyeOff, Copy, Check, ExternalLink, Lock } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { TopNavigation } from '@/components/TopNavigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function MyProfilePage() {
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPublic, setIsPublic] = useState(false)
    const [bio, setBio] = useState('')
    const [bioSaved, setBioSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }
            const { data } = await supabase
                .from('profiles')
                .select('username, is_public, bio')
                .eq('id', user.id)
                .single()
            if (data) {
                setProfile(data)
                setIsPublic(data.is_public || false)
                setBio(data.bio || '')
            }
            setLoading(false)
        }
        load()
    }, [])

    async function handleToggle() {
        setToggling(true)
        const newVal = !isPublic
        setIsPublic(newVal)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').update({ is_public: newVal }).eq('id', user.id)
        }
        setToggling(false)
    }

    async function handleSaveBio() {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').update({ bio }).eq('id', user.id)
        }
        setSaving(false)
        setBioSaved(true)
        setTimeout(() => setBioSaved(false), 2000)
    }

    function copyUrl() {
        if (!profile?.username) return
        navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <TopNavigation />
                <div className="space-y-4 animate-pulse">
                    <div className="h-10 w-48 bg-white/5 rounded-xl" />
                    <div className="h-64 w-full bg-white/5 rounded-xl" />
                    <div className="h-32 w-full bg-white/5 rounded-xl" />
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="space-y-8">
                <TopNavigation />
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
                    <Lock className="w-16 h-16 text-gray-700" />
                    <p className="text-xl font-bold text-gray-400">Please sign in to view your profile</p>
                    <Link href="/login" className="px-4 py-2 bg-[#ccf381] text-black font-bold rounded-xl text-sm hover:bg-[#bbe075] transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    const profileUrl = profile?.username ? `/profile/${profile.username}` : '#'
    const originUrl = typeof window !== 'undefined' ? window.location.origin : ''

    return (
        <div className="space-y-8">
            <TopNavigation />

            <StaggerContainer className="space-y-6 max-w-2xl mx-auto">
                {/* Header */}
                <StaggerItem>
                    <div className="border-b border-[#222] pb-5">
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Globe className="w-7 h-7 text-blue-400" />
                            My Public Profile
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Control what the world sees about your trading</p>
                    </div>
                </StaggerItem>

                {/* Avatar + Identity */}
                <StaggerItem>
                    <div className="flex items-center gap-4 p-5 bg-[#0f0f0f] rounded-2xl border border-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ccf381] to-[#7ec8e3] flex items-center justify-center text-2xl font-black text-black shrink-0 shadow-lg">
                            {profile?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-black text-white truncate">@{profile?.username || 'unknown'}</h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Shield size={12} className="text-[#ccf381]" />
                                <span className="text-[10px] font-bold text-[#ccf381] tracking-wider uppercase">Verified Trader Profile</span>
                            </div>
                        </div>
                        {isPublic && profile?.username && (
                            <Link
                                href={profileUrl}
                                target="_blank"
                                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                            >
                                <ExternalLink size={12} />
                                View Public
                            </Link>
                        )}
                    </div>
                </StaggerItem>

                {/* Public Toggle */}
                <StaggerItem>
                    <div className="p-5 bg-[#0f0f0f] rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPublic ? 'bg-[#ccf381]/15' : 'bg-white/5'}`}>
                                    {isPublic
                                        ? <Eye className="w-5 h-5 text-[#ccf381]" />
                                        : <EyeOff className="w-5 h-5 text-gray-600" />
                                    }
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Public Profile</p>
                                    <p className="text-[11px] text-gray-600 mt-0.5">
                                        {isPublic ? '✅ Visible to anyone on the internet' : '🔒 Hidden — only you can see this'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggle}
                                disabled={toggling}
                                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isPublic ? 'bg-[#ccf381]' : 'bg-[#333]'} ${toggling ? 'opacity-50' : ''}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${isPublic ? 'left-[26px]' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* Share URL — shown when public */}
                        {isPublic && profile?.username && (
                            <div className="flex items-center gap-2 p-3 bg-[#050505] rounded-xl border border-white/5">
                                <Globe size={13} className="text-blue-400 shrink-0" />
                                <code className="text-[11px] text-gray-400 flex-1 truncate">{originUrl}/profile/{profile.username}</code>
                                <button
                                    onClick={copyUrl}
                                    className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#ccf381] transition-colors shrink-0"
                                >
                                    {copied ? <Check size={12} className="text-[#ccf381]" /> : <Copy size={12} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        )}
                    </div>
                </StaggerItem>

                {/* Bio */}
                <StaggerItem>
                    <div className="p-5 bg-[#0f0f0f] rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Bio / Description</label>
                            <span className="text-[10px] text-gray-700">{bio.length}/200</span>
                        </div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            placeholder="Tell the world about your trading journey..."
                            className="w-full h-24 bg-[#050505] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 focus:border-[#ccf381]/50 focus:ring-1 focus:ring-[#ccf381]/20 outline-none resize-none transition-all"
                        />
                        <button
                            onClick={handleSaveBio}
                            disabled={saving}
                            className="w-full py-2.5 rounded-xl bg-[#ccf381] text-black text-sm font-bold hover:bg-[#bbe075] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? 'Saving...' : bioSaved ? '✅ Saved!' : 'Save Bio'}
                        </button>
                    </div>
                </StaggerItem>

                {/* Privacy Note */}
                <StaggerItem>
                    <div className="flex gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-500 leading-relaxed">
                            <span className="text-blue-400 font-bold">Privacy Protected:</span> Your public profile only shows Win Rate, Profit Factor, and Streak percentages. <strong className="text-white">Dollar amounts and account balances are never exposed.</strong>
                        </div>
                    </div>
                </StaggerItem>
            </StaggerContainer>
        </div>
    )
}

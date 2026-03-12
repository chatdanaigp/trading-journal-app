'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Globe, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { TopNavigation } from '@/components/TopNavigation'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

function useLang() {
    const [dict, setDict] = useState<any>(null)
    useEffect(() => {
        const lang = (document.cookie.match(/tj_language=(\w+)/)?.[1] || 'EN') as 'EN' | 'TH'
        import('@/utils/dictionaries').then(mod => setDict(mod.dictionaries[lang]))
    }, [])
    return dict
}

export default function MyProfilePage() {
    const dict = useLang()
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPublic, setIsPublic] = useState(false)
    const [bio, setBio] = useState('')
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from('profiles').select('username, is_public, bio').eq('id', user.id).single()
            if (data) {
                setProfile(data)
                setIsPublic(data.is_public || false)
                setBio(data.bio || '')
            }
            setLoading(false)
        }
        load()
    }, [])

    async function handleSave() {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').update({ is_public: isPublic, bio }).eq('id', user.id)
        }
        setSaving(false)
    }

    async function handleToggle() {
        const newVal = !isPublic
        setIsPublic(newVal)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').update({ is_public: newVal }).eq('id', user.id)
        }
    }

    function copyUrl() {
        if (!profile?.username) return
        navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.username}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!dict || loading) return <PageSkeleton />

    const profileUrl = profile?.username ? `/profile/${profile.username}` : '#'

    return (
        <div className="space-y-8">
            <TopNavigation />

            <StaggerContainer className="space-y-6">
                <StaggerItem>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#333] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                <Globe className="w-8 h-8 text-blue-400" />
                                {dict?.profile?.myProfileTitle || 'My Public Profile'}
                            </h1>
                            <p className="text-gray-500 mt-1">{dict?.profile?.myProfileSubtitle || 'Control what the world sees about your trading'}</p>
                        </div>
                    </div>
                </StaggerItem>

                {/* Profile Preview Card */}
                <StaggerItem>
                    <Card className="relative border-0 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#0d0d0d] to-[#000000] z-0" />
                        <div className="absolute inset-0 border border-blue-500/10 rounded-xl pointer-events-none z-20" />

                        <CardContent className="p-6 relative z-10 space-y-6">
                            {/* Avatar + Username */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ccf381] to-[#bbe075] flex items-center justify-center text-2xl font-black text-black">
                                    {profile?.username?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">@{profile?.username || 'unknown'}</h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Shield size={12} className="text-[#ccf381]" />
                                        <span className="text-[10px] font-bold text-[#ccf381]">Verified Trader</span>
                                    </div>
                                </div>
                            </div>

                            {/* Public Toggle */}
                            <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    {isPublic ? <Eye className="w-5 h-5 text-[#ccf381]" /> : <EyeOff className="w-5 h-5 text-gray-600" />}
                                    <div>
                                        <p className="text-sm font-bold text-white">{dict?.profile?.publicToggle || 'Public Profile'}</p>
                                        <p className="text-[10px] text-gray-600">{isPublic ? (dict?.profile?.publicDesc || 'Anyone can view your stats') : (dict?.profile?.privateDesc || 'Profile is hidden')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggle}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-[#ccf381]' : 'bg-[#333]'}`}
                                >
                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPublic ? 'left-[26px]' : 'left-0.5'}`} />
                                </button>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{dict?.profile?.bioLabel || 'Bio / Description'}</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength={200}
                                    placeholder={dict?.profile?.bioPlaceholder || 'Tell the world about your trading journey...'}
                                    className="w-full h-20 bg-[#0d0d0d] border border-[#333] rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-700 focus:border-[#ccf381] outline-none resize-none"
                                />
                                <div className="flex justify-between">
                                    <span className="text-[9px] text-gray-700">{bio.length}/200</span>
                                    <button onClick={handleSave} disabled={saving} className="text-xs font-bold text-[#ccf381] hover:text-white transition-colors">
                                        {saving ? 'Saving...' : (dict?.profile?.saveBio || 'Save Bio')}
                                    </button>
                                </div>
                            </div>

                            {/* Share URL */}
                            {isPublic && profile?.username && (
                                <div className="flex items-center gap-2 p-3 bg-[#0d0d0d] rounded-xl border border-white/5">
                                    <Globe size={14} className="text-blue-400 shrink-0" />
                                    <code className="text-xs text-gray-400 flex-1 truncate">{typeof window !== 'undefined' ? window.location.origin : ''}/profile/{profile.username}</code>
                                    <button onClick={copyUrl} className="text-xs font-bold text-gray-500 hover:text-[#ccf381] transition-colors flex items-center gap-1">
                                        {copied ? <Check size={12} className="text-[#ccf381]" /> : <Copy size={12} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                    <Link href={profileUrl} target="_blank" className="text-xs text-blue-400 hover:text-blue-300">
                                        <ExternalLink size={12} />
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </StaggerItem>

                {/* Info */}
                <StaggerItem>
                    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 space-y-2">
                        <p className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">{dict?.profile?.infoTitle || '🔒 Privacy Note'}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {dict?.profile?.infoDesc || 'Your public profile only shows percentages (Win Rate, Profit Factor) and streaks. Dollar amounts and account balances are NEVER exposed.'}
                        </p>
                    </div>
                </StaggerItem>
            </StaggerContainer>
        </div>
    )
}

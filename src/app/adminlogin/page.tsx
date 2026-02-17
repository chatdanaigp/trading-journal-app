'use client'

import { useState } from 'react'
import { adminLogin } from '../auth/actions'
import { Shield, Loader2, Lock, Mail, KeyRound, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await adminLogin(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-red-500 blur-[200px] opacity-5 rounded-full pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-[#ccf381] blur-[200px] opacity-5 rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/5">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Admin <span className="text-red-400">Access</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Authorized personnel only</p>
                </div>

                {/* Login Form */}
                <form action={handleSubmit} className="bg-[#0d0d0d] rounded-2xl border border-white/5 p-8 space-y-5 shadow-2xl">
                    {/* Security Badge */}
                    <div className="flex items-center gap-2 text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>This area is restricted to authorized administrators.</span>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5 block flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="admin@example.com"
                            className="w-full bg-[#151515] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5 block flex items-center gap-1">
                            <KeyRound className="w-3 h-3" /> Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-[#151515] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/30 transition-colors"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Shield className="w-4 h-4" />
                                Sign In to Admin Panel
                            </>
                        )}
                    </button>
                </form>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link href="/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                        ← Back to User Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

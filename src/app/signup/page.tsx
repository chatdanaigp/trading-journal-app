'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signup } from '../auth/actions'
import Link from 'next/link'
import { useState } from 'react'

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        const res = await signup(formData)
        if (res?.error) {
            setError(res.error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#ccf381] blur-[150px] opacity-10 rounded-full pointer-events-none" />

            <Card className="w-full max-w-md border-[#333] bg-[#1a1a1a]/80 backdrop-blur-xl text-white shadow-2xl relative z-10">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-[#ccf381] rounded-xl flex items-center justify-center -rotate-3 shadow-[0_0_15px_rgba(204,243,129,0.4)]">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription className="text-gray-400">
                        Join the community and start tracking your success
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md border border-red-500/20 text-center">
                            {error}
                        </div>
                    )}
                    <form action={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="John Trader"
                                required
                                className="bg-[#0d0d0d] border-[#333] text-white placeholder:text-gray-600 focus:border-[#ccf381] focus:ring-[#ccf381]/20 transition-all"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="trader@example.com"
                                required
                                className="bg-[#0d0d0d] border-[#333] text-white placeholder:text-gray-600 focus:border-[#ccf381] focus:ring-[#ccf381]/20 transition-all"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-[#0d0d0d] border-[#333] text-white focus:border-[#ccf381] focus:ring-[#ccf381]/20 transition-all"
                            />
                        </div>
                        <Button className="w-full bg-[#ccf381] hover:bg-[#b0d16a] text-black font-bold shadow-[0_0_20px_rgba(204,243,129,0.2)] transition-all hover:scale-[1.02]" type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-center text-sm text-gray-500 w-full">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#ccf381] hover:underline font-medium hover:text-[#b0d16a]">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

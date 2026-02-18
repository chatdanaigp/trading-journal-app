'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Shield, CheckCircle, XCircle } from 'lucide-react'

export default function VerifyPage() {
    const router = useRouter()
    const [clientId, setClientId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/verify-client-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: clientId.trim() }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
                setLoading(false)
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)

        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่')
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 5)
        setClientId(value)
        if (error) setError('')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
            <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-[#ccf381] blur-[200px] opacity-10 rounded-full pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-[#5865F2] blur-[200px] opacity-10 rounded-full pointer-events-none" />

            <Card className="w-full max-w-md border-[#222] bg-[#0d0d0d]/90 backdrop-blur-xl text-white shadow-2xl shadow-black/50">
                <CardHeader className="space-y-3 text-center pb-2">
                    {/* Shield Icon */}
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(204,243,129,0.15)]">
                        <Shield className="w-8 h-8 text-[#ccf381]" />
                    </div>

                    <CardTitle className="text-2xl font-black tracking-tight">
                        ยืนยัน <span className="text-[#ccf381]">Client ID</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm leading-relaxed">
                        กรอก Client ID 5 หลักสุดท้ายจาก Broker{' '}
                        <span className="text-[#ccf381] font-semibold">ConnextFX</span>{' '}
                        เพื่อเข้าใช้งานระบบ
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Client ID Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                                Client ID (5 หลัก)
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="เช่น 78619"
                                value={clientId}
                                onChange={handleInputChange}
                                disabled={loading || success}
                                maxLength={5}
                                className="h-14 text-center text-2xl font-mono font-bold tracking-[0.5em] bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-base focus:border-[#ccf381] focus:ring-[#ccf381]/20 transition-all"
                            />
                            <p className="text-xs text-gray-500 text-center">
                                ดูได้จาก Client Area ของ ConnextFX
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 animate-in fade-in duration-300">
                                <XCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-2 bg-[#ccf381]/10 text-[#ccf381] text-sm p-3 rounded-lg border border-[#ccf381]/20 animate-in fade-in duration-300">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span>ยืนยันสำเร็จ! กำลังเข้าสู่ระบบ...</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={clientId.length !== 5 || loading || success}
                            className="w-full h-12 bg-[#ccf381] hover:bg-[#b8e060] text-black font-bold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#ccf381]/20 hover:shadow-[#ccf381]/30"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    กำลังตรวจสอบ...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    ยืนยันสำเร็จ!
                                </>
                            ) : (
                                'ยืนยัน Client ID'
                            )}
                        </Button>

                        {/* Help Text */}
                        <p className="text-center text-xs text-gray-600 mt-4">
                            ไม่มี Client ID?{' '}
                            <a
                                href="https://clients.svg.connextfx.com/links/go/1544"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#ccf381] hover:underline"
                            >
                                สมัครสมาชิก ConnextFX
                            </a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

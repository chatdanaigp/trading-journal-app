'use client'

import { useEffect, useState } from 'react'
import { repairRecentTrades } from '../actions'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function RepairPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [repairedCount, setRepairedCount] = useState(0)
    const [error, setError] = useState('')

    const handleRepair = async () => {
        setStatus('loading')
        try {
            const result = await repairRecentTrades()
            if (result.success) {
                setStatus('success')
                setRepairedCount(result.repaired || 0)
            } else {
                setStatus('error')
                setError(result.error || 'Unknown error')
            }
        } catch (e) {
            setStatus('error')
            setError('Failed to execute repair')
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
            <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
                <div className="space-y-2">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Data Repair Tool</h1>
                    <p className="text-gray-400 text-sm">
                        This tool will restore trades that were accidentally saved with auto-deducted commission. 
                        It will add the commission back to the profit so it can be calculated dynamically.
                    </p>
                </div>

                <div className="py-8 flex justify-center">
                    {status === 'loading' && <Loader2 className="w-12 h-12 text-[#ccf381] animate-spin" />}
                    {status === 'success' && <CheckCircle2 className="w-12 h-12 text-[#ccf381]" />}
                    {status === 'error' && <AlertCircle className="w-12 h-12 text-red-500" />}
                    {status === 'idle' && (
                        <div className="w-12 h-12 rounded-full bg-[#ccf381]/10 flex items-center justify-center text-[#ccf381]">
                            1
                        </div>
                    )}
                </div>

                {status === 'success' && (
                    <div className="bg-[#ccf381]/10 border border-[#ccf381]/20 rounded-2xl p-4 text-[#ccf381] font-bold">
                        Successfully repaired {repairedCount} trades!
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 text-sm">
                        Error: {error}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {status === 'idle' && (
                        <Button 
                            onClick={handleRepair}
                            className="w-full bg-[#ccf381] hover:bg-[#d4f78e] text-black font-black py-6 rounded-2xl h-14"
                        >
                            START REPAIR
                        </Button>
                    )}
                    
                    {status === 'success' && (
                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-6 rounded-2xl h-14">
                                BACK TO DASHBOARD
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

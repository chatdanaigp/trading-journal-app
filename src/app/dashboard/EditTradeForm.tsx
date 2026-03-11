'use client'

import { updateTrade } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
import { useSWRConfig } from 'swr'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'

interface EditTradeFormProps {
    initialData: any
    onSuccess: () => void
}

export function EditTradeForm({ initialData, onSuccess }: EditTradeFormProps) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const { mutate } = useSWRConfig()

    // Form State (initialized with props)
    const [type, setType] = useState(initialData.type || 'BUY')
    const [entry, setEntry] = useState(initialData.entry_price || '')
    const [exit, setExit] = useState(initialData.exit_price || '')
    const [lot, setLot] = useState(initialData.lot_size || '')
    const [profitAmount, setProfitAmount] = useState(() => {
        const p = initialData.profit
        return p ? String(Math.abs(Number(p))) : ''
    })
    const [profitSign, setProfitSign] = useState<'+' | '-'>(() => {
        return initialData.profit && Number(initialData.profit) < 0 ? '-' : '+'
    })
    const [symbol, setSymbol] = useState(initialData.symbol || 'XAUUSD')
    const [notes, setNotes] = useState(initialData.notes || '')
    const [tradeDate, setTradeDate] = useState(() => {
        if (initialData.created_at) {
            return new Date(initialData.created_at).toISOString().split('T')[0]
        }
        return new Date().toISOString().split('T')[0]
    })
    const [sl, setSl] = useState(initialData.stop_loss || '')
    const [tp, setTp] = useState(initialData.take_profit || '')

    // Compute Planned Risk:Reward Ratio
    const computeRR = () => {
        const entryVal = parseFloat(String(entry))
        const slVal = parseFloat(String(sl))
        const tpVal = parseFloat(String(tp))
        if (isNaN(entryVal) || isNaN(slVal) || isNaN(tpVal)) return null
        const risk = Math.abs(entryVal - slVal)
        const reward = Math.abs(tpVal - entryVal)
        if (risk === 0) return null
        return (reward / risk).toFixed(1)
    }
    const plannedRR = computeRR()

    // The actual profit value with sign applied
    const actualProfit = profitAmount ? (profitSign === '-' ? `-${profitAmount}` : profitAmount) : ''

    // Auto-Calculate Logic
    const handleCalculation = (changedField: string, val: string) => {
        const currentEntry = changedField === 'entry' ? parseFloat(val) : parseFloat(String(entry))
        const currentLot = changedField === 'lot' ? parseFloat(val) : parseFloat(String(lot))
        const currentSign = changedField === 'sign' ? val : profitSign
        const rawAmount = changedField === 'profit' ? parseFloat(val) : parseFloat(profitAmount)
        const currentProfit = !isNaN(rawAmount) ? (currentSign === '-' ? -rawAmount : rawAmount) : NaN
        const currentType = changedField === 'type' ? val : type

        // Calculate Exit if Entry, Lot, Profit exist
        if (!isNaN(currentEntry) && !isNaN(currentLot) && !isNaN(currentProfit) && currentLot !== 0) {
            const priceDistance = currentProfit / (currentLot * 100)
            let calculatedExit = 0

            if (currentType === 'BUY') {
                calculatedExit = currentEntry + priceDistance
            } else {
                calculatedExit = currentEntry - priceDistance
            }

            setExit(calculatedExit.toFixed(2))
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage(null)

        // Capture exact local time for the selected date
        const tradeDateStr = formData.get('tradeDate') as string;
        if (tradeDateStr) {
            const [year, month, day] = tradeDateStr.split('-').map(Number);

            // If it's already an existing trade, maybe try using its original time
            const originalDate = new Date(initialData.created_at || new Date());
            const exactDate = new Date(year, month - 1, day, originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());
            formData.append('exactCreatedAt', exactDate.toISOString());
        }

        try {
            // Append tradeId manually since it's not an input field
            formData.append('tradeId', initialData.id)

            const result = await updateTrade(formData)

            if (result?.success) {
                setMessage({ type: 'success', text: 'Trade updated successfully!' })
                
                // Invalidate all API keys instantly
                mutate((key: any) => typeof key === 'string' && key.startsWith('/api/'))

                setTimeout(() => {
                    onSuccess() // Close modal
                }, 1000)
            } else {
                setMessage({ type: 'error', text: result?.error || 'Failed to update trade' })
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="grid gap-5">
            {/* Status Message */}
            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-center ${message.type === 'success' ? 'bg-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Row 1: Date + Symbol */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="tradeDate" className="text-gray-400">Date</Label>
                    <Input
                        id="tradeDate"
                        name="tradeDate"
                        type="date"
                        required
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white [color-scheme:dark]"
                        value={tradeDate}
                        onChange={(e) => setTradeDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="symbol" className="text-gray-400">Symbol</Label>
                    <Input
                        id="symbol"
                        name="symbol"
                        required
                        className="uppercase bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                </div>
            </div>

            {/* Row 2: Type */}
            <div className="grid gap-2">
                <Label htmlFor="type" className="text-gray-400">Type</Label>
                <div className="flex relative rounded-xl overflow-hidden border border-[#333] h-11 w-full shrink-0 bg-[#0a0a0a] p-1">
                    <LazyMotion features={domAnimation}>
                        <AnimatePresence>
                            <m.div
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg ${type === 'BUY' ? 'bg-[#ccf381]/20' : 'bg-red-500/20'}`}
                                animate={{
                                    left: type === 'BUY' ? '4px' : 'calc(50%)',
                                    backgroundColor: type === 'BUY' ? 'rgba(204, 243, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        </AnimatePresence>
                    </LazyMotion>
                    <button
                        type="button"
                        onClick={() => {
                            setType('BUY')
                            handleCalculation('type', 'BUY')
                        }}
                        className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors duration-200 rounded-lg ${type === 'BUY' ? 'text-[#ccf381]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>BUY</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setType('SELL')
                            handleCalculation('type', 'SELL')
                        }}
                        className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors duration-200 rounded-lg ${type === 'SELL' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <ArrowDownRight className="w-4 h-4" />
                        <span>SELL</span>
                    </button>
                    <input type="hidden" name="type" value={type} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="lotSize" className="text-gray-400">Lot Size</Label>
                    <Input
                        id="lotSize"
                        name="lotSize"
                        type="number"
                        step="0.01"
                        required
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white"
                        value={lot}
                        onChange={(e) => {
                            setLot(e.target.value)
                            handleCalculation('lot', e.target.value)
                        }}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="entryPrice" className="text-gray-400">Entry</Label>
                    <Input
                        id="entryPrice"
                        name="entryPrice"
                        type="number"
                        step="0.01"
                        required
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white"
                        value={entry}
                        onChange={(e) => {
                            setEntry(e.target.value)
                            handleCalculation('entry', e.target.value)
                        }}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="exitPrice" className="text-gray-400">Exit</Label>
                    <Input
                        id="exitPrice"
                        name="exitPrice"
                        type="number"
                        step="0.01"
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white"
                        value={exit}
                        onChange={(e) => setExit(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label className="text-gray-400">Profit / Loss ($)</Label>
                {/* Animated Profit/Loss Toggle */}
                <div className="flex relative rounded-xl overflow-hidden border border-[#333] h-10 w-full shrink-0 bg-[#0a0a0a] p-1">
                    <LazyMotion features={domAnimation}>
                        <AnimatePresence>
                            <m.div
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg ${profitSign === '+' ? 'bg-[#ccf381]/20' : 'bg-red-500/20'}`}
                                animate={{
                                    left: profitSign === '+' ? '4px' : 'calc(50%)',
                                    backgroundColor: profitSign === '+' ? 'rgba(204, 243, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        </AnimatePresence>
                    </LazyMotion>
                    <button
                        type="button"
                        onClick={() => {
                            setProfitSign('+')
                            handleCalculation('sign', '+')
                        }}
                        className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors duration-200 rounded-lg ${profitSign === '+' ? 'text-[#ccf381]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span>Profit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setProfitSign('-')
                            handleCalculation('sign', '-')
                        }}
                        className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors duration-200 rounded-lg ${profitSign === '-' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <TrendingDown className="w-4 h-4" />
                        <span>Loss</span>
                    </button>
                </div>
                {/* Amount Input */}
                <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${profitSign === '+' ? 'text-[#ccf381]' : 'text-red-400'}`}>
                        {profitSign === '+' ? '+$' : '-$'}
                    </span>
                    <Input
                        id="profitAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        className={`pl-8 bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white font-bold ${profitSign === '-' ? 'focus:border-red-400' : ''}`}
                        value={profitAmount}
                        onChange={(e) => {
                            setProfitAmount(e.target.value)
                            handleCalculation('profit', e.target.value)
                        }}
                    />
                    <input type="hidden" name="profit" value={actualProfit} />
                </div>
            </div>

            {/* SL & TP Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="stopLoss" className="text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                        Stop Loss
                    </Label>
                    <Input
                        id="stopLoss"
                        name="stopLoss"
                        type="number"
                        step="0.01"
                        placeholder="1995.00"
                        className="bg-[#0d0d0d] border-[#333] focus:border-red-400 text-white"
                        value={sl}
                        onChange={(e) => setSl(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="takeProfit" className="text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ccf381] inline-block"></span>
                        Take Profit
                    </Label>
                    <Input
                        id="takeProfit"
                        name="takeProfit"
                        type="number"
                        step="0.01"
                        placeholder="2010.00"
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white"
                        value={tp}
                        onChange={(e) => setTp(e.target.value)}
                    />
                </div>
            </div>

            {/* RR Badge */}
            {plannedRR && (
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                        Number(plannedRR) >= 2 ? 'bg-[#ccf381]/10 border-[#ccf381]/30 text-[#ccf381]' :
                        Number(plannedRR) >= 1 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                        'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                        Planned RR 1:{plannedRR}
                    </span>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="notes" className="text-gray-400">Note</Label>
                <Input
                    id="notes"
                    name="notes"
                    className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-[#ccf381] hover:bg-[#bbe075] text-black font-bold h-12 rounded-xl text-md transition-all mt-2">
                {loading ? 'Updating...' : 'Save Changes'}
            </Button>
        </form>
    )
}

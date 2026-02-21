'use client'

import { createTrade } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'

export function TradeForm({ dict }: { dict?: any }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // Form State for Auto-Calculation
    const [type, setType] = useState('BUY')
    const [symbol, setSymbol] = useState('XAUUSD')
    const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().split('T')[0])
    const [entry, setEntry] = useState('')
    const [exit, setExit] = useState('')
    const [lot, setLot] = useState('')
    const [profitAmount, setProfitAmount] = useState('')
    const [profitSign, setProfitSign] = useState<'+' | '-'>('+')
    const [points, setPoints] = useState<number | null>(null)

    // The actual profit value with sign applied
    const actualProfit = profitAmount ? (profitSign === '-' ? `-${profitAmount}` : profitAmount) : ''

    // Auto-Calculate Exit & Points when Profit/Lot/Entry changes
    // Using simple math for XAUUSD (Contract Size 100)
    // Formula: Profit = (Exit - Entry) * Lot * 100 [BUY]
    //          Profit = (Entry - Exit) * Lot * 100 [SELL]
    // Therefore: Exit = Entry + (Profit / (Lot * 100)) [BUY]
    //            Exit = Entry - (Profit / (Lot * 100)) [SELL]
    // Points = Profit / Lot (User definition: $10 / 0.01 = 1000 pts)
    const handleCalculation = (changedField: string, val: string) => {
        // We use the latest values, overriding the state for the changed field
        const currentEntry = changedField === 'entry' ? parseFloat(val) : parseFloat(entry)
        const currentLot = changedField === 'lot' ? parseFloat(val) : parseFloat(lot)
        const currentSign = changedField === 'sign' ? val : profitSign
        const rawAmount = changedField === 'profit' ? parseFloat(val) : parseFloat(profitAmount)
        const currentProfit = !isNaN(rawAmount) ? (currentSign === '-' ? -rawAmount : rawAmount) : NaN
        const currentType = changedField === 'type' ? val : type

        // Calculate Points if Profit & Lot exist
        if (!isNaN(currentProfit) && !isNaN(currentLot) && currentLot !== 0) {
            const calculatedPoints = currentProfit / currentLot
            // Only update if it's significant
            setPoints(Math.round(calculatedPoints))
        } else {
            setPoints(null)
        }

        // Calculate Exit if Entry, Lot, Profit exist AND Exit is empty/user wants calc
        // (Here we auto-fill Exit if Profit is entered)
        if (!isNaN(currentEntry) && !isNaN(currentLot) && !isNaN(currentProfit) && currentLot !== 0) {
            const priceDistance = currentProfit / (currentLot * 100)
            let calculatedExit = 0

            if (currentType === 'BUY') {
                calculatedExit = currentEntry + priceDistance
            } else {
                calculatedExit = currentEntry - priceDistance
            }

            // Auto-update Exit input
            setExit(calculatedExit.toFixed(2))
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage(null)

        try {
            const result = await createTrade(formData)

            if (result?.success) {
                setMessage({ type: 'success', text: 'Trade saved successfully!' })
                formRef.current?.reset()
                // Reset state
                setSymbol('XAUUSD')
                setTradeDate(new Date().toISOString().split('T')[0])
                setEntry('')
                setExit('')
                setLot('')
                setProfitAmount('')
                setProfitSign('+')
                setPoints(null)
            } else {
                setMessage({ type: 'error', text: result?.error || 'Failed to save trade' })
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form ref={formRef} action={handleSubmit} className="grid gap-5 p-6 border border-[#252525] rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] shadow-lg relative overflow-hidden">

            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccf381]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {/* Status Message */}
            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-center ${message.type === 'success' ? 'bg-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Row 1: Date + Symbol */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="tradeDate" className="text-gray-400">{dict?.tradeForm?.date || "Date"}</Label>
                    <Input
                        id="tradeDate"
                        name="tradeDate"
                        type="date"
                        required
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white h-11 rounded-xl [color-scheme:dark]"
                        value={tradeDate}
                        onChange={(e) => setTradeDate(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="symbol" className="text-gray-400">{dict?.tradeForm?.symbol || "Symbol"}</Label>
                    <Input
                        id="symbol"
                        name="symbol"
                        required
                        className="uppercase bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                </div>
            </div>

            {/* Row 2: Type */}
            <div className="grid gap-2">
                <Label htmlFor="type" className="text-gray-400">{dict?.tradeForm?.type || "Type"}</Label>
                <div className="relative">
                    <select
                        name="type"
                        className="flex h-11 w-full rounded-xl border border-[#333] bg-[#0d0d0d] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ccf381] appearance-none"
                        required
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value)
                            handleCalculation('type', e.target.value)
                        }}
                    >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="lotSize" className="text-gray-400">{dict?.tradeForm?.lotSize || "Lot Size"}</Label>
                    <Input
                        id="lotSize"
                        name="lotSize"
                        type="number"
                        step="0.01"
                        placeholder="0.01"
                        required
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl"
                        value={lot}
                        onChange={(e) => {
                            setLot(e.target.value)
                            handleCalculation('lot', e.target.value)
                        }}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="entryPrice" className="text-gray-400">{dict?.tradeForm?.entryPrice || "Entry"}</Label>
                    <Input
                        id="entryPrice"
                        name="entryPrice"
                        type="number"
                        step="0.01"
                        placeholder="2000.00"
                        required
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl"
                        value={entry}
                        onChange={(e) => {
                            setEntry(e.target.value)
                            handleCalculation('entry', e.target.value)
                        }}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="exitPrice" className="text-gray-400">{dict?.tradeForm?.exitPrice || "Exit"}</Label>
                    <Input
                        id="exitPrice"
                        name="exitPrice"
                        type="number"
                        step="0.01"
                        placeholder="2005.00"
                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl"
                        value={exit}
                        onChange={(e) => setExit(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <div className="flex justify-between items-center">
                    <Label className="text-gray-400">{dict?.tradeForm?.profitLoss || "Profit / Loss ($)"}</Label>
                    {points !== null && (
                        <span className={`text-xs font-mono font-bold ${points >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                            {dict?.tradeForm?.tpSl || 'TP/SL'}: {points > 0 ? '+' : ''}{points.toLocaleString()} {dict?.tradeForm?.pts || 'pts'}
                        </span>
                    )}
                </div>
                {/* Profit/Loss Toggle */}
                <div className="flex rounded-xl overflow-hidden border border-[#333] h-10">
                    <button
                        type="button"
                        onClick={() => {
                            setProfitSign('+')
                            handleCalculation('sign', '+')
                        }}
                        className={`flex-1 text-sm font-bold transition-all ${profitSign === '+'
                            ? 'bg-[#ccf381]/20 text-[#ccf381] border-r border-[#333]'
                            : 'bg-[#0d0d0d] text-gray-500 border-r border-[#333] hover:bg-[#1a1a1a]'
                            }`}
                    >
                        ✅ {dict?.tradeForm?.profitBtn || 'Profit'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setProfitSign('-')
                            handleCalculation('sign', '-')
                        }}
                        className={`flex-1 text-sm font-bold transition-all ${profitSign === '-'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-[#0d0d0d] text-gray-500 hover:bg-[#1a1a1a]'
                            }`}
                    >
                        ❌ {dict?.tradeForm?.lossBtn || 'Loss'}
                    </button>
                </div>
                {/* Amount Input (always positive) */}
                <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${profitSign === '+' ? 'text-[#ccf381]' : 'text-red-400'}`}>
                        {profitSign === '+' ? '+$' : '-$'}
                    </span>
                    <Input
                        id="profitAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="50.00"
                        className={`pl-8 bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl font-bold ${profitSign === '-' ? 'focus:border-red-400' : ''}`}
                        value={profitAmount}
                        onChange={(e) => {
                            setProfitAmount(e.target.value)
                            handleCalculation('profit', e.target.value)
                        }}
                    />
                    {/* Hidden input sends the actual signed value */}
                    <input type="hidden" name="profit" value={actualProfit} />
                </div>
            </div>

            <div className="grid gap-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="notes" className="text-gray-400">{dict?.tradeForm?.notes || "Note"}</Label>
                </div>
                <Input id="notes" name="notes" placeholder={dict?.tradeForm?.rationale || "Trade rationale..."} className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-[#ccf381] hover:bg-[#bbe075] text-black font-bold h-12 rounded-xl text-md transition-all mt-2">
                {loading ? (dict?.tradeForm?.logging || 'Logging Trade...') : `+ ${dict?.tradeForm?.addTrade || 'Log Trade'}`}
            </Button>
        </form>
    )
}

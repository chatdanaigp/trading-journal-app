'use client'

import { createTrade } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
import { LotSizeCombobox } from '@/components/ui/LotSizeCombobox'
import { isSameDay } from 'date-fns'
import { getTradingDay } from '@/utils/date-helpers'

export function TradeForm({ dict, trades = [], portSize = 0, goalPercent = 0 }: { dict?: any, trades?: any[], portSize?: number, goalPercent?: number }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // Calculate today's net profit
    const today = getTradingDay(new Date())
    const todayTrades = trades.filter((t: any) => {
        if (!t.created_at) return false
        return isSameDay(getTradingDay(t.created_at), today)
    })
    const netProfitToday = todayTrades.reduce((sum: number, t: any) => sum + (t.profit || 0), 0)

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
        <form ref={formRef} action={handleSubmit} className="flex flex-col h-full p-6 border border-[#252525] rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#0d0d0d] shadow-lg relative overflow-hidden">

            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccf381]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex flex-col flex-grow justify-between gap-5 relative z-10">
                {/* Status Message */}
                {message && (
                    <div className={`mb-5 p-4 rounded-xl text-sm font-bold flex items-center justify-center ${message.type === 'success' ? 'bg-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/20 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col gap-5">
                    {/* Row 1: Date | Symbol | Type | Lot Size */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tradeDate" className="text-gray-400 text-xs">{dict?.tradeForm?.date || "Date"}</Label>
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
                            <Label htmlFor="symbol" className="text-gray-400 text-xs">{dict?.tradeForm?.symbol || "Symbol"}</Label>
                            <Input
                                id="symbol"
                                name="symbol"
                                required
                                className="uppercase bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-gray-400 text-xs">{dict?.tradeForm?.type || "Type"}</Label>
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
                        <div className="grid gap-2">
                            <Label htmlFor="lotSize" className="text-gray-400 text-xs">{dict?.tradeForm?.lotSize || "Lot Size"}</Label>
                            <LotSizeCombobox
                                value={lot}
                                onChange={(val) => {
                                    setLot(val)
                                    handleCalculation('lot', val)
                                }}
                                dict={dict}
                            />
                        </div>
                    </div>

                    {/* Row 2: Entry | Exit | Profit Toggle & Amount */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="entryPrice" className="text-gray-400 text-xs">{dict?.tradeForm?.entryPrice || "Entry"}</Label>
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
                            <Label htmlFor="exitPrice" className="text-gray-400 text-xs">{dict?.tradeForm?.exitPrice || "Exit"}</Label>
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

                        {/* Profit section spans 2 columns */}
                        <div className="grid gap-2 md:col-span-2">
                            <div className="flex justify-between items-center h-[16px]">
                                <Label className="text-gray-400 text-xs">{dict?.tradeForm?.profitLoss || "Profit / Loss ($)"}</Label>
                                {points !== null && (
                                    <span className={`text-[10px] font-mono font-bold ${points >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                        {dict?.tradeForm?.tpSl || 'TP/SL'}: {points > 0 ? '+' : ''}{points.toLocaleString()} {dict?.tradeForm?.pts || 'pts'}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 h-11">
                                {/* Toggle Container */}
                                <div className="flex rounded-xl overflow-hidden border border-[#333] w-1/3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfitSign('+')
                                            handleCalculation('sign', '+')
                                        }}
                                        className={`flex-1 text-[11px] font-bold transition-all ${profitSign === '+'
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
                                        className={`flex-1 text-[11px] font-bold transition-all ${profitSign === '-'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-[#0d0d0d] text-gray-500 hover:bg-[#1a1a1a]'
                                            }`}
                                    >
                                        ❌ {dict?.tradeForm?.lossBtn || 'Loss'}
                                    </button>
                                </div>

                                {/* Amount Input Container */}
                                <div className="relative w-2/3">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${profitSign === '+' ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                        {profitSign === '+' ? '+$' : '-$'}
                                    </span>
                                    <Input
                                        id="profitAmount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="50.00"
                                        className={`pl-8 bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-full rounded-xl font-bold ${profitSign === '-' ? 'focus:border-red-400' : ''}`}
                                        value={profitAmount}
                                        onChange={(e) => {
                                            setProfitAmount(e.target.value)
                                            handleCalculation('profit', e.target.value)
                                        }}
                                    />
                                    <input type="hidden" name="profit" value={actualProfit} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Notes & Submit */}
                    <div className="flex flex-col md:flex-row gap-4 items-end mt-2">
                        <div className="flex-grow grid gap-2">
                            <Label htmlFor="notes" className="text-gray-400 text-xs">{dict?.tradeForm?.notes || "Note"}</Label>
                            <Input id="notes" name="notes" placeholder={dict?.tradeForm?.rationale || "Trade rationale..."} className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full md:w-auto md:min-w-[150px] bg-[#ccf381] hover:bg-[#bbe075] text-black font-bold h-11 rounded-xl text-sm transition-all shrink-0">
                            {loading ? (dict?.tradeForm?.logging || 'Logging Trade...') : `+ ${dict?.tradeForm?.addTrade || 'Log Trade'}`}
                        </Button>
                    </div>

                    {/* Row 4: Challenge Daily Progress */}
                    {portSize > 0 && goalPercent > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#333]">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dict?.challenge?.dailyTarget || 'Daily Challenge Target'}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-bold ${netProfitToday >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                        ${netProfitToday.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">
                                        / ${(portSize * (goalPercent / 100) / 20).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 bg-[#0d0d0d] rounded-full overflow-hidden border border-white/5 relative">
                                {netProfitToday > 0 && (
                                    <div
                                        className="h-full bg-gradient-to-r from-[#a3d149] to-[#ccf381] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((netProfitToday / (portSize * (goalPercent / 100) / 20)) * 100, 100)}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    )
}

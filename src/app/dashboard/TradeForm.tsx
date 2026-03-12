'use client'

import { createTrade } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
import { useSWRConfig } from 'swr'
import { LotSizeCombobox } from '@/components/ui/LotSizeCombobox'
import { isSameDay } from 'date-fns'
import { getTradingDay } from '@/utils/date-helpers'
import { CheckCircle2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ImagePlus, X } from 'lucide-react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'

export function TradeForm({ dict, trades = [], portSize = 0, goalPercent = 0 }: { dict?: any, trades?: any[], portSize?: number, goalPercent?: number }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const { mutate } = useSWRConfig()

    // Calculate total net profit
    const totalNetProfit = trades.reduce((sum: number, t: any) => sum + (t.profit || 0), 0)

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
    const [sl, setSl] = useState('')
    const [tp, setTp] = useState('')
    const [strategy, setStrategy] = useState('')
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const STRATEGY_PRESETS = ['Breakout', 'Reversal', 'Trend', 'Scalping', 'News', 'Range', 'Other']

    // Compute Planned Risk:Reward Ratio
    const computeRR = () => {
        const entryVal = parseFloat(entry)
        const slVal = parseFloat(sl)
        const tpVal = parseFloat(tp)
        if (isNaN(entryVal) || isNaN(slVal) || isNaN(tpVal)) return null
        const risk = Math.abs(entryVal - slVal)
        const reward = Math.abs(tpVal - entryVal)
        if (risk === 0) return null
        return (reward / risk).toFixed(1)
    }
    const plannedRR = computeRR()

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

        // Capture exact local time for the selected date
        const tradeDateStr = formData.get('tradeDate') as string;
        if (tradeDateStr) {
            const [year, month, day] = tradeDateStr.split('-').map(Number);
            const now = new Date();
            // Create a new date object keeping the exact current local Hour/Minute/Second 
            // but mapped to the selected Calendar Year/Month/Day
            const exactDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
            formData.append('exactCreatedAt', exactDate.toISOString());
        }

        try {
            const result = await createTrade(formData)

            if (result?.success) {
                // Show overlay for 2 seconds
                setShowSuccessOverlay(true)
                setTimeout(() => setShowSuccessOverlay(false), 2000)

                setMessage({ type: 'success', text: 'Trade saved successfully!' })
                formRef.current?.reset()

                // Invalidate all SWR keys instantly across Dashboard, Analytics, Journal, etc.
                mutate((key: any) => typeof key === 'string' && key.startsWith('/api/'))

                // Reset state
                setSymbol('XAUUSD')
                setTradeDate(new Date().toISOString().split('T')[0])
                setEntry('')
                setExit('')
                setLot('')
                setProfitAmount('')
                setProfitSign('+')
                setPoints(null)
                setSl('')
                setTp('')
                setStrategy('')
                setScreenshotFile(null)
                setScreenshotPreview(null)
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
                            <div className="flex relative rounded-[14px] overflow-hidden border border-[#222] h-11 w-full shrink-0 bg-[#0d0d0d] p-1 shadow-inner">
                                <LazyMotion features={domAnimation}>
                                    <AnimatePresence>
                                        <m.div
                                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm"
                                            animate={{
                                                left: type === 'BUY' ? '4px' : 'calc(50%)',
                                                backgroundColor: type === 'BUY' ? 'rgba(204, 243, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)'
                                            }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        >
                                            <div className={`absolute inset-0 rounded-lg border ${type === 'BUY' ? 'border-[#ccf381]/30' : 'border-red-400/30'}`} />
                                        </m.div>
                                    </AnimatePresence>
                                </LazyMotion>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setType('BUY')
                                        handleCalculation('type', 'BUY')
                                    }}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-black tracking-widest transition-colors duration-300 rounded-lg ${type === 'BUY' ? 'text-[#ccf381]' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <LazyMotion features={domAnimation}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                            <m.path 
                                                d="M7 17L17 7M17 7H7M17 7V17" 
                                                initial={false}
                                                animate={{ 
                                                    pathLength: type === 'BUY' ? 1 : 0.01, 
                                                    opacity: type === 'BUY' ? 1 : 0.4,
                                                    scale: type === 'BUY' ? 1 : 0.8
                                                }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                            />
                                        </svg>
                                    </LazyMotion>
                                    BUY
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setType('SELL')
                                        handleCalculation('type', 'SELL')
                                    }}
                                    className={`flex-1 relative z-10 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-black tracking-widest transition-colors duration-300 rounded-lg ${type === 'SELL' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <LazyMotion features={domAnimation}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                            <m.path 
                                                d="M7 7L17 17M17 17H7M17 17V7" 
                                                initial={false}
                                                animate={{ 
                                                    pathLength: type === 'SELL' ? 1 : 0.01, 
                                                    opacity: type === 'SELL' ? 1 : 0.4,
                                                    scale: type === 'SELL' ? 1 : 0.8
                                                }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                            />
                                        </svg>
                                    </LazyMotion>
                                    SELL
                                </button>
                                <input type="hidden" name="type" value={type} />
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
                                <div className="flex items-center gap-2">
                                    {plannedRR && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                            Number(plannedRR) >= 2 ? 'bg-[#ccf381]/10 border-[#ccf381]/30 text-[#ccf381]' :
                                            Number(plannedRR) >= 1 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                            'bg-red-500/10 border-red-500/30 text-red-400'
                                        }`}>
                                            {dict?.tradeForm?.riskReward || 'RR'} 1:{plannedRR}
                                        </span>
                                    )}
                                    {points !== null && (
                                        <span className={`text-[10px] font-mono font-bold ${points >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>
                                            {dict?.tradeForm?.tpSl || 'TP/SL'}: {points > 0 ? '+' : ''}{points.toLocaleString()} {dict?.tradeForm?.pts || 'pts'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 h-11">
                                {/* Animated Toggle Container */}
                                <div className="flex relative rounded-[14px] overflow-hidden border border-[#222] min-w-[140px] w-2/5 shrink-0 bg-[#0d0d0d] p-1 shadow-inner h-11">
                                    <LazyMotion features={domAnimation}>
                                        <AnimatePresence>
                                            <m.div
                                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm"
                                                animate={{
                                                    left: profitSign === '+' ? '4px' : 'calc(50%)',
                                                    backgroundColor: profitSign === '+' ? 'rgba(204, 243, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)'
                                                }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                                <div className={`absolute inset-0 rounded-lg border ${profitSign === '+' ? 'border-[#ccf381]/30' : 'border-red-400/30'}`} />
                                            </m.div>
                                        </AnimatePresence>
                                    </LazyMotion>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfitSign('+')
                                            handleCalculation('sign', '+')
                                        }}
                                        className={`flex-1 relative z-10 flex items-center justify-center gap-1 transition-colors duration-300 rounded-lg ${profitSign === '+' ? 'text-[#ccf381]' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <LazyMotion features={domAnimation}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                <m.path 
                                                    d="M3 17L9 11L13 15L21 7M21 7H15M21 7V13" 
                                                    initial={false}
                                                    animate={{ 
                                                        pathLength: profitSign === '+' ? 1 : 0.01,
                                                        opacity: profitSign === '+' ? 1 : 0.4,
                                                        scale: profitSign === '+' ? 1 : 0.8
                                                    }}
                                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                                />
                                            </svg>
                                        </LazyMotion>
                                        <span className="text-[10px] xl:text-xs font-black tracking-widest">{dict?.tradeForm?.profitBtn || 'Profit'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfitSign('-')
                                            handleCalculation('sign', '-')
                                        }}
                                        className={`flex-1 relative z-10 flex items-center justify-center gap-1 transition-colors duration-300 rounded-lg ${profitSign === '-' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <LazyMotion features={domAnimation}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                <m.path 
                                                    d="M3 7L9 13L13 9L21 17M21 17H15M21 17V11" 
                                                    initial={false}
                                                    animate={{ 
                                                        pathLength: profitSign === '-' ? 1 : 0.01,
                                                        opacity: profitSign === '-' ? 1 : 0.4,
                                                        scale: profitSign === '-' ? 1 : 0.8
                                                    }}
                                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                                />
                                            </svg>
                                        </LazyMotion>
                                        <span className="text-[10px] xl:text-xs font-black tracking-widest">{dict?.tradeForm?.lossBtn || 'Loss'}</span>
                                    </button>
                                </div>

                                <div className="relative w-3/5">
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

                    {/* Combined SL/TP, Strategy and Screenshot into a two-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: SL/TP and Strategy */}
                        <div className="md:col-span-2 flex flex-col gap-5">
                            {/* SL & TP Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stopLoss" className="text-gray-400 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                                        {dict?.tradeForm?.stopLoss || "Stop Loss"}
                                    </Label>
                                    <Input
                                        id="stopLoss"
                                        name="stopLoss"
                                        type="number"
                                        step="0.01"
                                        placeholder="1995.00"
                                        className="bg-[#0d0d0d] border-[#333] focus:border-red-400 text-white placeholder:text-gray-700 h-11 rounded-xl"
                                        value={sl}
                                        onChange={(e) => setSl(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="takeProfit" className="text-gray-400 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ccf381] inline-block"></span>
                                        {dict?.tradeForm?.takeProfit || "Take Profit"}
                                    </Label>
                                    <Input
                                        id="takeProfit"
                                        name="takeProfit"
                                        type="number"
                                        step="0.01"
                                        placeholder="2010.00"
                                        className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl"
                                        value={tp}
                                        onChange={(e) => setTp(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Strategy Row */}
                            <div className="grid gap-2">
                                <Label className="text-gray-400 text-xs">{dict?.tradeForm?.strategy || 'Strategy'}</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {STRATEGY_PRESETS.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => setStrategy(strategy === tag ? '' : tag)}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200 ${
                                                strategy === tag
                                                    ? 'bg-[#ccf381]/15 border-[#ccf381]/40 text-[#ccf381] shadow-[0_0_8px_rgba(204,243,129,0.15)]'
                                                    : 'bg-[#0d0d0d] border-[#333] text-gray-500 hover:border-[#555] hover:text-gray-300'
                                            }`}
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" name="strategy" value={strategy} />
                            </div>
                        </div>

                        {/* Right Column: Screenshot Upload - Expanded height */}
                        <div className="md:col-span-1 h-full min-h-[140px]">
                            <div className="grid gap-2 h-full flex flex-col">
                                <Label className="text-gray-400 text-xs">{dict?.tradeForm?.screenshot || 'Chart Screenshot'}</Label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="screenshot"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            setScreenshotFile(file)
                                            setScreenshotPreview(URL.createObjectURL(file))
                                        }
                                    }}
                                />
                                <div className="flex-grow">
                                    {screenshotPreview ? (
                                        <div className="relative w-full h-full min-h-[120px] rounded-xl overflow-hidden border border-[#333] group bg-[#0d0d0d]">
                                            <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20 mr-2"
                                                >
                                                    <ImagePlus size={20} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setScreenshotFile(null)
                                                        setScreenshotPreview(null)
                                                        if (fileInputRef.current) fileInputRef.current.value = ''
                                                    }}
                                                    className="p-2 bg-red-500/20 backdrop-blur-md rounded-full text-red-400 hover:bg-red-500/30 transition-all border border-red-500/30"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-full min-h-[120px] rounded-xl border-2 border-dashed border-[#222] bg-[#0d0d0d]/50 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#ccf381]/30 hover:bg-[#ccf381]/5 hover:text-gray-400 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center group-hover:bg-[#ccf381]/10 transition-colors">
                                                <ImagePlus size={20} className="group-hover:text-[#ccf381]" />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold">{dict?.tradeForm?.uploadImage || 'Upload Chart'}</span>
                                                <span className="text-[10px] opacity-50">JPG, PNG, WebP</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Notes & Submit */}
                    <div className="flex flex-col md:flex-row gap-4 items-end mt-2">
                        <div className="flex-grow grid gap-2">
                            <Label htmlFor="notes" className="text-gray-400 text-xs">{dict?.tradeForm?.notes || "Note"}</Label>
                            <Input id="notes" name="notes" placeholder={dict?.tradeForm?.rationale || "Trade rationale..."} className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full md:w-auto md:min-w-[150px] bg-[#ccf381] hover:bg-[#bbe075] text-black font-bold h-11 rounded-xl text-sm transition-all shrink-0">
                            {loading ? (dict?.tradeForm?.logging || 'Logging Trade...') : `+ ${dict?.tradeForm?.addTrade || 'Log Trade'}`}
                        </Button>
                    </div>

                    {/* Row 4: Total & Daily Challenge Progress */}
                    {portSize > 0 && goalPercent > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#333] flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <div className="flex gap-4 md:gap-8">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{dict?.challenge?.portSize || 'Capital'}</p>
                                        <p className="text-sm font-bold text-white">${portSize.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{dict?.dashboard?.netProfit || 'Net Profit'}</p>
                                        <p className="text-sm font-bold text-[#ccf381]">
                                            <span className={`${totalNetProfit >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>${totalNetProfit.toFixed(2)}</span>
                                            <span className="text-xs text-gray-500 font-normal hidden sm:inline-block ml-1">/ ${(portSize * (goalPercent / 100)).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{dict?.challenge?.dailyTarget || 'Daily Target'}</p>
                                    <p className="text-sm font-bold text-white">
                                        <span className={`${netProfitToday >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>${netProfitToday.toFixed(2)}</span>
                                        <span className="text-gray-500 font-normal"> / ${(portSize * (goalPercent / 100) / 20).toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="h-1.5 bg-[#0d0d0d] rounded-full overflow-hidden border border-white/5 relative">
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

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccessOverlay && (
                    <LazyMotion features={domAnimation}>
                        <m.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1e1e1e]/90 backdrop-blur-sm rounded-2xl border border-[#ccf381]/30"
                        >
                            <m.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                className="w-16 h-16 bg-[#ccf381]/20 rounded-full flex items-center justify-center mb-4"
                            >
                                <CheckCircle2 className="w-8 h-8 text-[#ccf381]" />
                            </m.div>
                            <h3 className="text-xl font-bold text-white mb-2">{dict?.tradeForm?.successTitle || 'Trade Recorded!'}</h3>
                            <p className="text-gray-400 text-sm">{dict?.tradeForm?.successDesc || 'Your trade has been successfully logged.'}</p>
                        </m.div>
                    </LazyMotion>
                )}
            </AnimatePresence>
        </form>
    )
}

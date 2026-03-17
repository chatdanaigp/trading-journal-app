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
import { CheckCircle2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ImagePlus, X, Sparkles } from 'lucide-react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { StrategyDropdown } from '@/components/ui/StrategyDropdown'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

export function TradeForm({ dict, trades = [], portSize = 0, goalPercent = 0, portfolioId = null }: { dict?: any, trades?: any[], portSize?: number, goalPercent?: number, portfolioId?: string | null }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const { mutate } = useSWRConfig()

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
    const [commissionPerLot, setCommissionPerLot] = useState('')
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const STRATEGY_PRESETS = ['Breakout', 'Reversal', 'Trend', 'Scalping', 'News', 'Range', 'FVG', 'OB', 'BOS', 'CHoCH', 'Liquidity', 'SMC', 'S/D', 'EMA', 'Fibonacci', 'Divergence', 'VBP', 'VWAP', 'Other']

    const computeRR = () => {
        const slVal = parseFloat(sl)
        const tpVal = parseFloat(tp)
        if (isNaN(slVal) || isNaN(tpVal) || slVal === 0) return null
        return (tpVal / slVal).toFixed(1)
    }
    const plannedRR = computeRR()
    const actualProfit = profitAmount ? (profitSign === '-' ? `-${profitAmount}` : profitAmount) : ''

    const handleCalculation = (changedField: string, val: string) => {
        const currentEntry = changedField === 'entry' ? parseFloat(val) : parseFloat(entry)
        const currentLot = changedField === 'lot' ? parseFloat(val) : parseFloat(lot)
        const currentSign = changedField === 'sign' ? val : profitSign
        const rawAmount = changedField === 'profit' ? parseFloat(val) : parseFloat(profitAmount)
        const currentProfit = !isNaN(rawAmount) ? (currentSign === '-' ? -rawAmount : rawAmount) : NaN
        const currentType = changedField === 'type' ? val : type

        if (!isNaN(currentProfit) && !isNaN(currentLot) && currentLot !== 0) {
            const calculatedPoints = currentProfit / currentLot
            setPoints(Math.round(calculatedPoints))
        } else {
            setPoints(null)
        }

        if (!isNaN(currentEntry) && !isNaN(currentLot) && !isNaN(currentProfit) && currentLot !== 0) {
            const priceDistance = currentProfit / (currentLot * 100)
            let calculatedExit = currentType === 'BUY' ? currentEntry + priceDistance : currentEntry - priceDistance
            setExit(calculatedExit.toFixed(2))
        }
    }

    const calculateNetProfit = () => {
        const gross = parseFloat(profitAmount) || 0
        const cpl = parseFloat(commissionPerLot) || 0
        const lSize = parseFloat(lot) || 0
        const sign = profitSign === '-' ? -1 : 1
        const net = (gross * sign) - (cpl * lSize)
        return net
    }

    const netProfit = calculateNetProfit()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage(null)
        const tradeDateStr = formData.get('tradeDate') as string;
        if (tradeDateStr) {
            const [year, month, day] = tradeDateStr.split('-').map(Number);
            const now = new Date();
            const exactDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
            formData.append('exactCreatedAt', exactDate.toISOString());
        }

        // Apply Commission to Profit
        const finalNetProfit = calculateNetProfit()
        formData.set('profit', finalNetProfit.toString())

        try {
            const result = await createTrade(formData)
            if (result?.success) {
                setShowSuccessOverlay(true)
                setTimeout(() => setShowSuccessOverlay(false), 2000)
                setMessage({ type: 'success', text: 'Trade saved successfully!' })
                formRef.current?.reset()
                mutate((key: any) => typeof key === 'string' && key.startsWith('/api/'))
                setSymbol('XAUUSD')
                setTradeDate(new Date().toISOString().split('T')[0])
                setEntry(''); setExit(''); setLot(''); setProfitAmount(''); setProfitSign('+'); setPoints(null); setSl(''); setTp(''); setStrategy(''); setCommissionPerLot(''); setScreenshotFile(null); setScreenshotPreview(null);
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
        <Card className="relative overflow-hidden border-0 shadow-2xl h-full flex flex-col bg-[#0d0d0d]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505] z-0" />
            <div className="absolute inset-0 border border-white/5 rounded-xl z-20 pointer-events-none" />

            <CardContent className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none">{dict?.dashboard?.quickTrade || 'Quick Trade'}</h2>
                </div>

                <form ref={formRef} action={handleSubmit} className="flex flex-col flex-grow justify-between gap-5 relative z-10">
                    <input type="hidden" name="portfolioId" value={portfolioId || ''} />
                    {message && (
                        <div className={`mb-5 p-4 rounded-xl text-sm font-bold flex items-center justify-center ${message.type === 'success' ? 'bg-[#ccf381]/20 text-[#ccf381]' : 'bg-red-500/20 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="tradeDate" className="text-gray-400 text-xs">{dict?.tradeForm?.date || "Date"}</Label>
                                <Input id="tradeDate" name="tradeDate" type="date" required className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white h-11 rounded-xl [color-scheme:dark]" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="symbol" className="text-gray-400 text-xs">{dict?.tradeForm?.symbol || "Symbol"}</Label>
                                <Input id="symbol" name="symbol" required className="uppercase bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white h-11 rounded-xl" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type" className="text-gray-400 text-xs">{dict?.tradeForm?.type || "Type"}</Label>
                                <div className="flex relative rounded-[14px] overflow-hidden border border-[#222] h-11 w-full bg-[#0d0d0d] p-1">
                                    <LazyMotion features={domAnimation}><AnimatePresence><m.div className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm" animate={{ left: type === 'BUY' ? '4px' : 'calc(50%)', backgroundColor: type === 'BUY' ? 'rgba(204, 243, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)' }} transition={{ type: "spring", stiffness: 500, damping: 30 }}><div className={`absolute inset-0 rounded-lg border ${type === 'BUY' ? 'border-[#ccf381]/30' : 'border-red-400/30'}`} /></m.div></AnimatePresence></LazyMotion>
                                    <button type="button" onClick={() => { setType('BUY'); handleCalculation('type', 'BUY') }} className={`flex-1 relative z-10 text-xs font-black ${type === 'BUY' ? 'text-[#ccf381]' : 'text-gray-500'}`}>BUY</button>
                                    <button type="button" onClick={() => { setType('SELL'); handleCalculation('type', 'SELL') }} className={`flex-1 relative z-10 text-xs font-black ${type === 'SELL' ? 'text-red-400' : 'text-gray-500'}`}>SELL</button>
                                    <input type="hidden" name="type" value={type} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lotSize" className="text-gray-400 text-xs">{dict?.tradeForm?.lotSize || "Lot Size"}</Label>
                                <LotSizeCombobox value={lot} onChange={(val) => { setLot(val); handleCalculation('lot', val) }} dict={dict} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="grid gap-2">
                                <Label htmlFor="entryPrice" className="text-gray-400 text-xs">{dict?.tradeForm?.entryPrice || "Entry"}</Label>
                                <Input id="entryPrice" name="entryPrice" type="number" step="0.01" required placeholder="2000.00" className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" value={entry} onChange={(e) => { setEntry(e.target.value); handleCalculation('entry', e.target.value) }} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="exitPrice" className="text-gray-400 text-xs">{dict?.tradeForm?.exitPrice || "Exit"}</Label>
                                <Input id="exitPrice" name="exitPrice" type="number" step="0.01" placeholder="2005.00" className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" value={exit} onChange={(e) => setExit(e.target.value)} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <div className="flex justify-between items-center h-[16px]">
                                    <Label className="text-gray-400 text-xs">{dict?.tradeForm?.profitLoss || "Profit / Loss ($)"}</Label>
                                    {points !== null && <span className={`text-[10px] font-bold ${points >= 0 ? 'text-[#ccf381]' : 'text-red-400'}`}>{points > 0 ? '+' : ''}{points.toLocaleString()} pts</span>}
                                </div>
                                <div className="flex gap-2 h-11">
                                    <div className="flex relative rounded-[14px] overflow-hidden border border-[#222] min-w-[120px] bg-[#0d0d0d] p-1 shadow-inner h-11">
                                        <LazyMotion features={domAnimation}><AnimatePresence><m.div className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg" animate={{ left: profitSign === '+' ? '4px' : 'calc(50%)', backgroundColor: profitSign === '+' ? 'rgba(204, 243, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)' }} transition={{ type: "spring", stiffness: 500, damping: 30 }} /></AnimatePresence></LazyMotion>
                                        <button type="button" onClick={() => { setProfitSign('+'); handleCalculation('sign', '+') }} className={`flex-1 relative z-10 text-[10px] font-black ${profitSign === '+' ? 'text-[#ccf381]' : 'text-gray-500'}`}>PROFIT</button>
                                        <button type="button" onClick={() => { setProfitSign('-'); handleCalculation('sign', '-') }} className={`flex-1 relative z-10 text-[10px] font-black ${profitSign === '-' ? 'text-red-400' : 'text-gray-500'}`}>LOSS</button>
                                    </div>
                                    <div className="relative flex-grow">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${profitSign === '+' ? 'text-[#ccf381]' : 'text-red-400'}`}>{profitSign === '+' ? '+$' : '-$'}</span>
                                        <Input type="number" step="0.01" min="0" placeholder="50.00" className="pl-8 bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-full rounded-xl" value={profitAmount} onChange={(e) => { setProfitAmount(e.target.value); handleCalculation('profit', e.target.value) }} />
                                        <input type="hidden" name="profit" value={actualProfit} />
                                    </div>
                                </div>
                                {!isNaN(parseFloat(profitAmount)) && parseFloat(commissionPerLot) > 0 && (
                                    <div className="mt-2 px-1 flex justify-between items-center">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Net Profit (After Fee)</span>
                                        <span className={cn("text-xs font-black", netProfit >= 0 ? "text-[#ccf381]" : "text-red-400")}>
                                            {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="grid gap-2 md:col-span-1">
                                <Label htmlFor="stopLoss" className="text-gray-400 text-xs">Stop Loss</Label>
                                <Input id="stopLoss" name="stopLoss" type="number" step="0.01" placeholder="1995.00" className="bg-[#0d0d0d] border-[#333] focus:border-red-400 text-white placeholder:text-gray-700 h-11 rounded-xl" value={sl} onChange={(e) => setSl(e.target.value)} />
                            </div>
                            <div className="grid gap-2 md:col-span-1">
                                <Label htmlFor="takeProfit" className="text-gray-400 text-xs">Take Profit</Label>
                                <Input id="takeProfit" name="takeProfit" type="number" step="0.01" placeholder="2010.00" className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" value={tp} onChange={(e) => setTp(e.target.value)} />
                            </div>
                            <div className="col-span-2 self-end">
                                <StrategyDropdown value={strategy} onChange={setStrategy} options={STRATEGY_PRESETS} dict={dict} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                             <Label className="text-gray-400 text-xs flex items-center gap-1.5"><ImagePlus size={10} className="text-[#ccf381]" /> {dict?.tradeForm?.screenshot || 'Chart Screenshot'}</Label>
                             <input ref={fileInputRef} type="file" name="screenshot" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setScreenshotFile(file); setScreenshotPreview(URL.createObjectURL(file)); } }} />
                             {screenshotPreview ? (
                                <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden border border-[#333] group">
                                    <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Button type="button" onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="text-white hover:bg-white/10"><ImagePlus size={24} /></Button>
                                        <Button type="button" onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} variant="ghost" size="icon" className="text-red-400 hover:bg-red-400/10"><X size={24} /></Button>
                                    </div>
                                </div>
                             ) : (
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-xl border-2 border-dashed border-[#2a2a2a] bg-[#0a0a0a] flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-[#ccf381]/40 hover:bg-[#ccf381]/5 transition-all">
                                    <ImagePlus size={24} />
                                    <span className="text-[10px] font-black tracking-widest uppercase">UPLOAD CHART</span>
                                </button>
                             )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="flex-[1] grid gap-2 w-full md:w-auto">
                                <Label htmlFor="commission" className="text-gray-400 text-xs">Broker Commission ($ / Lot)</Label>
                                <Input id="commission" type="number" step="0.01" min="0" placeholder="7.00" className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" value={commissionPerLot} onChange={(e) => setCommissionPerLot(e.target.value)} />
                            </div>
                            <div className="flex-[2] grid gap-2 w-full md:w-auto">
                                <Label htmlFor="notes" className="text-gray-400 text-xs">Notes</Label>
                                <Input id="notes" name="notes" placeholder="Trade rationale..." className="bg-[#0d0d0d] border-[#333] focus:border-[#ccf381] text-white placeholder:text-gray-700 h-11 rounded-xl" />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full md:w-auto mt-6 bg-[#ccf381] hover:bg-[#bbe075] text-black font-extrabold h-11 px-8 rounded-xl shrink-0">
                                {loading ? 'Logging...' : '+ Add Trade'}
                            </Button>
                        </div>
                    </div>
                </form>

                <AnimatePresence>
                    {showSuccessOverlay && (
                        <LazyMotion features={domAnimation}>
                            <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
                                <div className="w-16 h-16 bg-[#ccf381]/20 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-[#ccf381]" /></div>
                                <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
                                <p className="text-gray-400 text-sm">Trade logged successfully.</p>
                            </m.div>
                        </LazyMotion>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}

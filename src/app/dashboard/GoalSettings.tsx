import { useState, useEffect } from 'react'
import { updateProfileGoals, updatePortfolioGoals } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Settings, Target, DollarSign, Percent, X } from 'lucide-react'
import { useSWRConfig } from 'swr'
import { showSuccess, showError } from '@/components/ui/Toast'
import type { Dictionary } from '@/utils/dictionaries'

export function GoalSettings({ initialPortSize, initialGoalPercent, initialCommissionPerLot, initialCurrency, portfolioId, dict }: { initialPortSize: number, initialGoalPercent: number, initialCommissionPerLot?: number, initialCurrency?: string, portfolioId?: string | null, dict?: Dictionary }) {
    const { mutate } = useSWRConfig()
    const [portSize, setPortSize] = useState<number | string>(initialPortSize)
    const [goalPercent, setGoalPercent] = useState<number | string>(initialGoalPercent)
    const [commissionPerLot, setCommissionPerLot] = useState<number | string>(initialCommissionPerLot || 0)
    const [currency, setCurrency] = useState<string>(initialCurrency || 'USD')
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Sync state with props when they change (e.g. portfolio switch)
    useEffect(() => {
        setPortSize(initialPortSize)
        setGoalPercent(initialGoalPercent)
        setCommissionPerLot(initialCommissionPerLot || 0)
        setCurrency(initialCurrency || 'USD')
    }, [initialPortSize, initialGoalPercent, initialCommissionPerLot, initialCurrency])
    
    async function handleSave() {
        setIsLoading(true)
        try {
            const validPortSize = Number(portSize)
            const validGoalPercent = Number(goalPercent)
            
            let result;
            if (portfolioId) {
                result = await updatePortfolioGoals(portfolioId, validPortSize, validGoalPercent, Number(commissionPerLot) || 0, currency)
            } else {
                result = await updateProfileGoals(validPortSize, validGoalPercent, undefined, Number(commissionPerLot) || 0, currency)
            }

            if (result?.error) {
                showError(result.error)
                return
            }

            // Force SWR to revalidate everything starting with /api/
            await mutate((key) => typeof key === 'string' && key.startsWith('/api/'))
            showSuccess(dict?.dashboard?.saveGoals ? 'บันทึกเป้าหมายสำเร็จ!' : 'Goals saved!')
            setIsOpen(false)
        } catch (error: unknown) {
            console.error('Error saving goals:', error)
            showError(error instanceof Error ? error.message : 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <div className="flex justify-end">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 text-[#ccf381] text-xs font-bold hover:bg-[#ccf381]/20 hover:border-[#ccf381]/30 transition-all group shadow-lg shadow-[#ccf381]/5"
                >
                    <Settings className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                    {dict?.dashboard?.setGoals || 'Set Goals'}
                    <Target className="w-3.5 h-3.5 opacity-50" />
                </button>
            </div>
        )
    }

    return (
        <div className="bg-[#151515] rounded-xl border border-white/10 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 w-full max-w-sm ml-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#ccf381]/10 border border-[#ccf381]/20 flex items-center justify-center">
                        <Target className="w-3.5 h-3.5 text-[#ccf381]" />
                    </div>
                    <span className="text-sm font-bold text-white">{dict?.dashboard?.goalSettingsTitle || 'Goal Settings'}</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>


            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="port-size" className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {dict?.admin?.portSize || 'Port Size'}
                    </Label>
                    <Input
                        id="port-size"
                        type="number"
                        value={portSize}
                        onChange={(e) => setPortSize(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-[#0e0e0e] border-white/5 h-9 text-sm text-white focus:border-[#ccf381]/30 rounded-lg"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="goal-percent" className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                        <Percent className="w-3 h-3" /> {dict?.admin?.goalPercent || 'Goal %'}
                    </Label>
                    <Input
                        id="goal-percent"
                        type="number"
                        value={goalPercent}
                        onChange={(e) => setGoalPercent(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-[#0e0e0e] border-white/5 h-9 text-sm text-white focus:border-[#ccf381]/30 rounded-lg"
                    />
                </div>

                <div className="col-span-2 space-y-1.5">
                    <Label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        Currency
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                currency === 'USD' 
                                ? 'bg-[#ccf381]/10 border-[#ccf381]/40 text-[#ccf381]' 
                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                        >
                            USD
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency('USC')}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                currency === 'USC' 
                                ? 'bg-[#ccf381]/10 border-[#ccf381]/40 text-[#ccf381]' 
                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                            }`}
                        >
                            USC
                        </button>
                    </div>
                </div>

                <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="commission" className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        Commission / Lot
                    </Label>
                    <Input
                        id="commission"
                        type="number"
                        step="0.01"
                        value={commissionPerLot}
                        onChange={(e) => setCommissionPerLot(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-[#0e0e0e] border-white/5 h-9 text-sm text-white focus:border-[#ccf381]/30 rounded-lg"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
                <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                    {dict?.admin?.cancel || 'Cancel'}
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#ccf381] text-black text-xs font-bold hover:bg-[#d4f78e] transition-all disabled:opacity-50 shadow-lg shadow-[#ccf381]/10"
                >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : `✓ ${dict?.dashboard?.saveGoals || 'Save Settings'}`}
                </button>
            </div>
        </div>
    )
}

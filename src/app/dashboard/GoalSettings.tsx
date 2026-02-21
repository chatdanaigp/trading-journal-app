'use client'

import { useState } from 'react'
import { updateProfileGoals } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Settings, Target, DollarSign, Percent, X } from 'lucide-react'

export function GoalSettings({ initialPortSize, initialGoalPercent, dict }: { initialPortSize: number, initialGoalPercent: number, dict?: any }) {
    const [portSize, setPortSize] = useState(initialPortSize)
    const [goalPercent, setGoalPercent] = useState(initialGoalPercent)
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleSave = async () => {
        setIsLoading(true)
        await updateProfileGoals(Number(portSize), Number(goalPercent))
        setIsLoading(false)
        setIsOpen(false)
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
        <div className="bg-[#151515] rounded-xl border border-white/10 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
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
                        onChange={(e) => setPortSize(Number(e.target.value))}
                        className="bg-[#0d0d0d] border-white/5 h-9 text-sm text-white focus:border-[#ccf381]/30 rounded-lg"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="goal-percent" className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                        <Percent className="w-3 h-3" /> {dict?.admin?.goalPercent || 'Profit Goal'}
                    </Label>
                    <Input
                        id="goal-percent"
                        type="number"
                        value={goalPercent}
                        onChange={(e) => setGoalPercent(Number(e.target.value))}
                        className="bg-[#0d0d0d] border-white/5 h-9 text-sm text-white focus:border-[#ccf381]/30 rounded-lg"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
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
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : `✓ ${dict?.dashboard?.saveGoals || 'Save Goals'}`}
                </button>
            </div>
        </div>
    )
}

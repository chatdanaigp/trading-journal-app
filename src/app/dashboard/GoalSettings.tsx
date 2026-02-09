'use client'

import { useState } from 'react'
import { updateProfileGoals } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'

export function GoalSettings({ initialPortSize, initialGoalPercent }: { initialPortSize: number, initialGoalPercent: number }) {
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
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="text-xs text-gray-500 hover:text-white"
                >
                    ⚙️ Goal Settings
                </Button>
            </div>
        )
    }

    return (
        <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Target Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="port-size" className="text-xs text-gray-500">Port Size ($)</Label>
                        <Input
                            id="port-size"
                            type="number"
                            value={portSize}
                            onChange={(e) => setPortSize(Number(e.target.value))}
                            className="bg-gray-950 border-gray-800 h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goal-percent" className="text-xs text-gray-500">Goal (%)</Label>
                        <Input
                            id="goal-percent"
                            type="number"
                            value={goalPercent}
                            onChange={(e) => setGoalPercent(Number(e.target.value))}
                            className="bg-gray-950 border-gray-800 h-8 text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 text-xs">Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700">
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Goals'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

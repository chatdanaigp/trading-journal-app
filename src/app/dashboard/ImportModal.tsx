'use client'

import { useState, useRef, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useSWRConfig } from 'swr'

interface ImportModalProps {
    isOpen: boolean
    onClose: () => void
    dict?: any
}

export function ImportModal({ isOpen, onClose, dict }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [format, setFormat] = useState<'generic' | 'mt4'>('generic')
    const [preview, setPreview] = useState<string[][]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { mutate } = useSWRConfig()

    const processFile = useCallback((f: File) => {
        setFile(f)
        setResult(null)

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
            if (lines.length < 2) return

            const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ','
            const hdrs = lines[0].split(delimiter).map(h => h.trim())
            setHeaders(hdrs)

            const previewRows = lines.slice(1, 6).map(line => line.split(delimiter).map(c => c.trim()))
            setPreview(previewRows)

            // Auto-detect MT4/MT5 format
            const headerStr = lines[0].toLowerCase()
            if (headerStr.includes('ticket') && (headerStr.includes('profit') || headerStr.includes('size'))) {
                setFormat('mt4')
            }
        }
        reader.readAsText(f)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const f = e.dataTransfer.files[0]
        if (f && (f.name.endsWith('.csv') || f.name.endsWith('.txt') || f.type.includes('text') || f.type.includes('csv'))) {
            processFile(f)
        }
    }, [processFile])

    const handleImport = async () => {
        if (!file) return
        setLoading(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('format', format)

            const res = await fetch('/api/import', { method: 'POST', body: formData })
            const data = await res.json()

            if (data.success) {
                setResult({ type: 'success', text: `Successfully imported ${data.imported} trades!` })
                mutate((key: any) => typeof key === 'string' && key.startsWith('/api/'))
                setTimeout(() => {
                    setFile(null)
                    setPreview([])
                    setHeaders([])
                    setResult(null)
                    onClose()
                }, 1500)
            } else {
                setResult({ type: 'error', text: data.error || 'Import failed' })
            }
        } catch (err) {
            setResult({ type: 'error', text: 'Network error. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setFile(null)
        setPreview([])
        setHeaders([])
        setResult(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={dict?.import?.title || '📥 Import Trades from CSV'}>
            <div className="space-y-4">
                {/* Format Selector */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setFormat('generic')}
                        className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                            format === 'generic'
                                ? 'bg-[#ccf381]/15 border-[#ccf381]/40 text-[#ccf381]'
                                : 'bg-[#0d0d0d] border-[#333] text-gray-500 hover:border-[#555]'
                        }`}
                    >
                        📊 Generic CSV
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormat('mt4')}
                        className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                            format === 'mt4'
                                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                                : 'bg-[#0d0d0d] border-[#333] text-gray-500 hover:border-[#555]'
                        }`}
                    >
                        📈 MT4/MT5 Statement
                    </button>
                </div>

                {/* Drop Zone */}
                {!file ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${
                            isDragging
                                ? 'border-[#ccf381] bg-[#ccf381]/5 scale-[1.02]'
                                : 'border-[#333] bg-[#0d0d0d] hover:border-[#555]'
                        }`}
                    >
                        <div className={`p-3 rounded-xl transition-colors ${isDragging ? 'bg-[#ccf381]/10' : 'bg-[#1a1a1a]'}`}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-[#ccf381]' : 'text-gray-600'}`} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-300">{dict?.import?.dropzone || 'Drag & drop your CSV file here'}</p>
                            <p className="text-xs text-gray-600 mt-1">{dict?.import?.dropzoneSub || 'or click to browse'}</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) processFile(f)
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* File Info */}
                        <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-white/5">
                            <FileSpreadsheet className="w-8 h-8 text-[#ccf381]" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB • {preview.length} rows preview • {format === 'mt4' ? 'MT4/MT5' : 'Generic CSV'}</p>
                            </div>
                            <button type="button" onClick={reset} className="text-gray-600 hover:text-red-400 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Preview Table */}
                        {preview.length > 0 && (
                            <div className="overflow-x-auto rounded-xl border border-white/5 max-h-[200px]">
                                <table className="w-full text-[10px]">
                                    <thead>
                                        <tr className="bg-[#1a1a1a] text-gray-500 uppercase tracking-wider">
                                            {headers.map((h, i) => (
                                                <th key={i} className="px-2 py-2 text-left font-bold whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {preview.map((row, ri) => (
                                            <tr key={ri} className="text-gray-400 hover:bg-[#252525]">
                                                {row.map((cell, ci) => (
                                                    <td key={ci} className="px-2 py-1.5 whitespace-nowrap">{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Result Message */}
                {result && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${
                        result.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {result.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {result.text}
                    </div>
                )}

                {/* Import Button */}
                {file && (
                    <Button
                        onClick={handleImport}
                        disabled={loading}
                        className="w-full bg-[#ccf381] hover:bg-[#bbe075] text-black font-bold h-11 rounded-xl text-sm transition-all"
                    >
                        {loading ? (dict?.import?.importing || 'Importing...') : `📥 ${dict?.import?.importBtn || 'Import Trades'}`}
                    </Button>
                )}
            </div>
        </Modal>
    )
}

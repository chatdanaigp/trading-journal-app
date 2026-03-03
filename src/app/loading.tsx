import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex-1 h-screen w-full flex flex-col items-center justify-center bg-[#0d0d0d]">
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 border-4 border-[#ccf381]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#ccf381] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-gray-400 font-mono text-sm tracking-widest uppercase">
                    Loading Data...
                </h2>
            </div>
        </div>
    )
}

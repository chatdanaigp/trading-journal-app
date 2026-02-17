'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" // Added overflow-y-auto
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden my-8" // Added my-8 for vertical spacing
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[#333] bg-[#151515]">
                                <h3 className="text-xl font-bold text-white">{title || 'Modal'}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#333] rounded-full text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar"> {/* Added scroll container */}
                                {children}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

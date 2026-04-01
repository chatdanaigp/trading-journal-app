'use client'

import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

type EmptyStateProps = {
    icon: LucideIcon
    title: string
    subtitle?: string
    actionLabel?: string
    actionHref?: string
    onAction?: () => void
    children?: ReactNode
}

/**
 * Reusable empty state component.
 * Shows an icon, message, and optional CTA to guide users forward.
 */
export function EmptyState({
    icon: Icon,
    title,
    subtitle,
    actionLabel,
    actionHref,
    onAction,
    children,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-5 group">
                <Icon className="w-7 h-7 text-gray-600 group-hover:text-gray-500 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-1">{title}</h3>
            {subtitle && (
                <p className="text-sm text-gray-600 max-w-xs leading-relaxed">{subtitle}</p>
            )}
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 text-[#ccf381] text-sm font-bold hover:bg-[#ccf381]/20 transition-all"
                >
                    {actionLabel}
                </Link>
            )}
            {actionLabel && onAction && !actionHref && (
                <button
                    onClick={onAction}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ccf381]/10 border border-[#ccf381]/20 text-[#ccf381] text-sm font-bold hover:bg-[#ccf381]/20 transition-all"
                >
                    {actionLabel}
                </button>
            )}
            {children}
        </div>
    )
}

'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'

/**
 * Global toast provider — place in root layout.
 * Styled to match the app's dark theme with #ccf381 accents.
 */
export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
                style: {
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e5e5e5',
                    fontSize: '13px',
                    fontWeight: 600,
                },
                classNames: {
                    success: 'toast-success',
                    error: 'toast-error',
                },
            }}
        />
    )
}

/** Show a success toast with brand-colored accent */
export function showSuccess(message: string) {
    toast.success(message, {
        style: {
            background: '#0f1a08',
            border: '1px solid rgba(204, 243, 129, 0.2)',
            color: '#ccf381',
        },
    })
}

/** Show an error toast */
export function showError(message: string) {
    toast.error(message, {
        style: {
            background: '#1a0808',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
        },
    })
}

export { toast }

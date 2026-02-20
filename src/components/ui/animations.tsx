'use client'

import React, { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface BaseProps extends HTMLMotionProps<"div"> {
    children: ReactNode
    className?: string
}

export function FadeIn({ children, delay = 0, className, ...props }: BaseProps & { delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function StaggerContainer({ children, className, staggerDelay = 0.1, ...props }: BaseProps & { staggerDelay?: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: staggerDelay }
                }
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className, ...props }: BaseProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.98 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }
                }
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function ScaleIn({ children, delay = 0, className, ...props }: BaseProps & { delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

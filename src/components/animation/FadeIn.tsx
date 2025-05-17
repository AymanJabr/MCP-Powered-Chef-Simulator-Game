'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeVariants } from '@/lib/animations'

interface FadeInProps {
    /** Show or hide the children */
    visible: boolean
    /** Unique key for the animated content */
    childrenKey?: string | number
    /** Content to render */
    children: ReactNode
}

export default function FadeIn({ visible, children, childrenKey }: FadeInProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key={childrenKey ?? 'fade-in'}
                    variants={fadeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
} 
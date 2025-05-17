import { Variants } from 'framer-motion'
import type { AnimationPreset } from '@/types/models'

// -----------------------------------------------------------------------------
// Generic reusable variants ---------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Simple fade-in and fade-out variant that is useful for UI elements.
 */
export const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2, ease: 'easeIn' },
    },
}

/**
 * Slide an element in from the right side of the screen and fade it out when
 * leaving. Great for customers entering or exiting the restaurant.
 */
export const slideInRight: Variants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 70, damping: 12 },
    },
    exit: {
        x: '100%',
        opacity: 0,
        transition: { duration: 0.2 },
    },
}

/**
 * A small bounce-in effect useful for notifications or finished dishes.
 */
export const popIn: Variants = {
    hidden: { scale: 0.3, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 500, damping: 30 },
    },
    exit: {
        scale: 0.3,
        opacity: 0,
        transition: { duration: 0.15 },
    },
}

/**
 * Shake variant – ideal for indicating an error, like an over-cooked dish.
 */
export const shake: Variants = {
    visible: {
        x: [0, -8, 8, -8, 8, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
    },
}

// -----------------------------------------------------------------------------
// Helper selector -------------------------------------------------------------
// -----------------------------------------------------------------------------

const presetMap: Record<AnimationPreset, Variants> = {
    fade: fadeVariants,
    slideInRight,
    popIn,
    shake,
}

/**
 * Retrieve a predefined animation variant by name.
 */
export function getPreset(preset: AnimationPreset): Variants {
    return presetMap[preset]
} 
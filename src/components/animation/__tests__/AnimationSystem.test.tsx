import React from 'react'
import { render, screen } from '@testing-library/react'
import FadeIn from '@/components/animation/FadeIn'

// Mock framer-motion to capture props without running animations during tests
jest.mock('framer-motion', () => {
    return {
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        motion: {
            div: ({ children, ...rest }: any) => (
                <div data-testid="motion-div" {...rest}>
                    {children}
                </div>
            ),
        },
    }
})

describe('Animation components', () => {
    it('renders children when visible', () => {
        render(
            <FadeIn visible={true}>
                <span>Animated content</span>
            </FadeIn>
        )

        expect(screen.getByText('Animated content')).toBeInTheDocument()
    })

    it('does not render children when not visible', () => {
        render(
            <FadeIn visible={false}>
                <span>Hidden</span>
            </FadeIn>
        )

        expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    })

    it('applies animation variants', () => {
        render(
            <FadeIn visible={true}>
                <span>Check variants</span>
            </FadeIn>
        )

        const motionDiv = screen.getByTestId('motion-div')
        expect(motionDiv).toHaveAttribute('initial', 'hidden')
        expect(motionDiv).toHaveAttribute('animate', 'visible')
        expect(motionDiv).toHaveAttribute('exit', 'exit')
    })
}) 
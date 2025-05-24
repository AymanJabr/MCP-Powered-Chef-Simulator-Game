import React from 'react'
import { render, screen } from '@testing-library/react'
import FadeIn from '@/components/animation/FadeIn'

// Define props for the mocked motion.div
interface MockMotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    initial?: string;
    animate?: string;
    exit?: string;
    // It's okay to keep this relatively simple for a mock if only these props are tested/used.
    // For a more complete mock, one might import and use MotionProps from framer-motion if needed.
}

// Mock framer-motion to capture props without running animations during tests
jest.mock('framer-motion', () => {
    // Define AnimatePresence mock separately for clarity if needed, or inline as here.
    const MockAnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
    MockAnimatePresence.displayName = 'MockAnimatePresence'; // Optional: for easier debugging

    const MockMotionDiv = React.forwardRef<HTMLDivElement, MockMotionDivProps>(
        ({ children, ...rest }, ref) => (
            <div data-testid="motion-div" ref={ref} {...rest}>
                {children}
            </div>
        )
    );
    MockMotionDiv.displayName = 'MockMotion.div'; // Assign display name

    return {
        AnimatePresence: MockAnimatePresence,
        motion: {
            div: MockMotionDiv, // Use the named component
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
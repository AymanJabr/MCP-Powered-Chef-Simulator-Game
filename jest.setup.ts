import '@testing-library/jest-dom'

// Polyfill ResizeObserver for Mantine ScrollArea & other components in jsdom
class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// @ts-ignore
global.ResizeObserver = ResizeObserver; 
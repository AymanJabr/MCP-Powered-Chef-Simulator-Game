import React from 'react'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import RestaurantView from '../RestaurantView'
import { useGameStore } from '@/state/game/gameStore'

// Mock sub-components to avoid deep rendering
jest.mock('../CustomerArea', () => {
    const MockCustomerArea = () => <div data-testid="customer-area" />
    MockCustomerArea.displayName = 'MockCustomerArea'
    return MockCustomerArea
})

jest.mock('../KitchenArea', () => {
    const MockKitchenArea = () => <div data-testid="kitchen-area" />
    MockKitchenArea.displayName = 'MockKitchenArea'
    return MockKitchenArea
})

jest.mock('../Inventory', () => {
    const MockInventory = () => <div data-testid="inventory" />
    MockInventory.displayName = 'MockInventory'
    return MockInventory
})

jest.mock('../PerformanceMetrics', () => {
    const MockPerf = () => <div data-testid="performance-metrics" />
    MockPerf.displayName = 'MockPerformanceMetrics'
    return MockPerf
})

// Mock game store
jest.mock('@/state/game/gameStore')

    // Provide mock store data
    ; (useGameStore as unknown as jest.Mock).mockReturnValue({
        game: {
            gameMode: 'manual',
            performanceMetrics: {
                customerSatisfaction: 80,
                orderCompletionTime: 45,
                financialPerformance: 1000,
                efficiency: 90,
            },
        },
    })

describe('RestaurantView', () => {
    it('renders all main areas', () => {
        render(<MantineProvider><RestaurantView /></MantineProvider>)

        expect(screen.getByTestId('customer-area')).toBeInTheDocument()
        expect(screen.getByTestId('kitchen-area')).toBeInTheDocument()
        expect(screen.getByTestId('inventory')).toBeInTheDocument()
        expect(screen.getByTestId('performance-metrics')).toBeInTheDocument()
    })
}) 
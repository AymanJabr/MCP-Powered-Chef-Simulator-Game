import React from 'react'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import RestaurantView from '../RestaurantView'
import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { usePlayerStore } from '@/state/player/playerStore'

const mockSetShowInventoryPanel = jest.fn();

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: (initialValue: unknown) => {
        // Target the showInventoryPanel state which is initialized to false
        if (initialValue === false && typeof initialValue === 'boolean') {
            return [true, mockSetShowInventoryPanel]; // Force showInventoryPanel to be initially true for this test
        }
        return jest.requireActual('react').useState(initialValue);
    },
}));

// Mock sub-components to avoid deep rendering
jest.mock('../restaurant/QueueArea', () => {
    const MockQueueArea = () => <div data-testid="queue-area" />
    MockQueueArea.displayName = 'MockQueueArea'
    return MockQueueArea
})

jest.mock('../restaurant/DiningArea', () => {
    const MockDiningArea = () => <div data-testid="customer-area" />
    MockDiningArea.displayName = 'MockDiningArea'
    return MockDiningArea
})

jest.mock('../restaurant/KitchenArea', () => {
    const MockKitchenArea = () => <div data-testid="kitchen-area" />
    MockKitchenArea.displayName = 'MockKitchenArea'
    return MockKitchenArea
})

jest.mock('../InventoryPanel', () => {
    const MockInventoryPanel = () => <div data-testid="inventory" />
    MockInventoryPanel.displayName = 'MockInventoryPanel'
    return MockInventoryPanel
})

// Mock other direct children of RestaurantView that might be necessary for it to render without errors
jest.mock('../restaurant/StatusBar', () => {
    const MockStatusBar = () => <div data-testid="status-bar" />
    MockStatusBar.displayName = 'MockStatusBar'
    return MockStatusBar
})
jest.mock('../restaurant/OrdersArea', () => {
    const MockOrdersArea = () => <div data-testid="orders-area" />
    MockOrdersArea.displayName = 'MockOrdersArea'
    return MockOrdersArea
})
jest.mock('../restaurant/ControlsArea', () => {
    const MockControlsArea = () => <div data-testid="controls-area" />
    MockControlsArea.displayName = 'MockControlsArea'
    return MockControlsArea
})
jest.mock('../restaurant/SelectionInfoPanel', () => {
    const MockSelectionInfoPanel = () => <div data-testid="selection-info-panel" />
    MockSelectionInfoPanel.displayName = 'MockSelectionInfoPanel'
    return MockSelectionInfoPanel
})

// Mock game store
jest.mock('@/state/game/gameStore')
jest.mock('@/state/game/restaurantStore')
jest.mock('@/state/game/kitchenStore')
jest.mock('@/state/player/playerStore')

    // Provide mock store data
    ; (useGameStore as unknown as jest.Mock).mockReturnValue({
        game: {
            gameMode: 'manual',
            difficulty: 1,
            timeElapsed: 0,
            isPaused: false,
            gamePhase: 'active',
            performanceMetrics: {
                customerSatisfaction: 80,
                orderCompletionTime: 45,
                financialPerformance: 1000,
                efficiency: 90,
            },
            settings: { audioEnabled: false, sfxVolume: 0, musicVolume: 0, tutorialCompleted: true }
        },
        actions: { setGamePhase: jest.fn(), resetGame: jest.fn() }
    });

; (useRestaurantStore as unknown as jest.Mock).mockReturnValue({
    restaurant: {
        name: 'Test Restaurant',
        level: 1,
        reputation: 3,
        funds: 1000,
        customerCapacity: 5,
        activeCustomers: [],
        customerQueue: [],
        activeOrders: [],
        completedOrders: [],
        inventory: [],
        equipment: [],
        menuItems: []
    },
    actions: {
        takeOrder: jest.fn(),
        seatCustomer: jest.fn(),
        initializeInventory: jest.fn(() => Promise.resolve()),
        initializeFullMenu: jest.fn(() => Promise.resolve()),
    }
});

; (useKitchenStore as unknown as jest.Mock).mockReturnValue({
    prepStations: [],
    cookingStations: [],
    activePreparations: {},
    activeCookingProcesses: [],
    platingStations: [],
    activePlating: {},
    actions: {}
});

; (usePlayerStore as unknown as jest.Mock).mockReturnValue({
    player: {
        id: 'player1',
        name: 'Test Player',
        score: 0,
        speed: 1,
        skill: 1,
        position: { x: 0, y: 0, area: 'kitchen' },
        currentAction: null,
        actionQueue: [],
        actionHistory: [],
        savedCommands: [],
        direction: 'down',
        animationState: 'idle',
        spriteConfig: {}
    },
    isCarryingItem: false,
    actions: { setPosition: jest.fn(), moveToArea: jest.fn() }
});

describe('RestaurantView', () => {
    beforeEach(() => {
        // Clear any previous mock calls if necessary, though useState mock above is global for this file
        mockSetShowInventoryPanel.mockClear();
        // Reset store mocks return values for each test if they were more complex
        // For now, the global mockReturnValues outside describe are fine.
    });

    it('renders all main areas', () => {
        render(<MantineProvider><RestaurantView /></MantineProvider>)

        expect(screen.getByTestId('customer-area')).toBeInTheDocument()
        expect(screen.getByTestId('kitchen-area')).toBeInTheDocument()
        expect(screen.getByTestId('inventory')).toBeInTheDocument()
        expect(screen.getByTestId('queue-area')).toBeInTheDocument()
        expect(screen.getByTestId('status-bar')).toBeInTheDocument()
        expect(screen.getByTestId('orders-area')).toBeInTheDocument()
        expect(screen.getByTestId('controls-area')).toBeInTheDocument()
    })
}) 
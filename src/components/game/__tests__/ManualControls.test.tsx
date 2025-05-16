import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ManualControls from '../ManualControls'
import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import * as customerGeneration from '@/lib/customerGeneration'
import * as orderFulfillment from '@/lib/orderFulfillment'
import * as inventoryManagement from '@/lib/inventoryManagement'
import { MantineProvider } from '@mantine/core'

jest.mock('@/state/game/gameStore')
jest.mock('@/state/game/restaurantStore')

jest.mock('@/lib/customerGeneration')
jest.mock('@/lib/orderFulfillment')
jest.mock('@/lib/inventoryManagement')

describe('ManualControls', () => {
    const togglePause = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

            ; (useGameStore as unknown as jest.Mock).mockReturnValue({
                game: { isPaused: false },
                actions: { togglePause },
            })

            ; (useRestaurantStore as unknown as jest.Mock).mockReturnValue({
                restaurant: {
                    activeOrders: [
                        { id: 'o1', status: 'plated' },
                        { id: 'o2', status: 'cooking' },
                    ],
                    inventory: [
                        { id: 'ing1', quantity: 2 },
                        { id: 'ing2', quantity: 10 },
                    ],
                },
            })
    })

    it('toggles pause', () => {
        render(<MantineProvider><ManualControls /></MantineProvider>)
        const pauseBtn = screen.getByRole('button', { name: /pause/i })
        fireEvent.click(pauseBtn)
        expect(togglePause).toHaveBeenCalled()
    })

    it('spawns customer', () => {
        const genMock = customerGeneration.generateCustomer as jest.Mock
        render(<MantineProvider><ManualControls /></MantineProvider>)
        const spawnBtn = screen.getByRole('button', { name: /spawn customer/i })
        fireEvent.click(spawnBtn)
        expect(genMock).toHaveBeenCalled()
    })

    it('serves plated orders', () => {
        const serveMock = orderFulfillment.serveOrder as jest.Mock
        render(<MantineProvider><ManualControls /></MantineProvider>)
        const serveBtn = screen.getByRole('button', { name: /serve plated orders/i })
        fireEvent.click(serveBtn)
        expect(serveMock).toHaveBeenCalledWith('o1')
    })

    it('restocks low ingredients', () => {
        const purchaseMock = inventoryManagement.purchaseIngredient as jest.Mock
        render(<MantineProvider><ManualControls /></MantineProvider>)
        const restockBtn = screen.getByRole('button', { name: /restock low ingredients/i })
        fireEvent.click(restockBtn)
        expect(purchaseMock).toHaveBeenCalledWith('ing1', 5)
    })
}) 
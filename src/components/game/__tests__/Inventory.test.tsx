import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Inventory from '../Inventory'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { purchaseIngredient } from '@/lib/inventoryManagement'
import { MantineProvider } from '@mantine/core'

jest.mock('@/state/game/restaurantStore')
jest.mock('@/lib/inventoryManagement')

const purchaseSpy = purchaseIngredient as jest.Mock

describe('Inventory component', () => {
    beforeEach(() => {
        purchaseSpy.mockClear()
            ; (useRestaurantStore as unknown as jest.Mock).mockReturnValue({
                restaurant: {
                    inventory: [
                        { id: 'ing1', name: 'Tomato', quantity: 2, cost: 1 },
                        { id: 'ing2', name: 'Cheese', quantity: 10, cost: 3 },
                    ],
                },
            })
    })

    afterAll(() => {
        purchaseSpy.mockReset()
    })

    it('renders inventory rows', () => {
        render(<MantineProvider><Inventory /></MantineProvider>)
        expect(screen.getByText('Tomato')).toBeInTheDocument()
        expect(screen.getByText('Cheese')).toBeInTheDocument()
    })

    it('allows purchasing low stock ingredient', () => {
        render(<MantineProvider><Inventory /></MantineProvider>)
        const buyButtons = screen.getAllByRole('button', { name: /buy/i })
        fireEvent.click(buyButtons[0])
        expect(purchaseSpy).toHaveBeenCalledWith('ing1', expect.any(Number))
    })
}) 
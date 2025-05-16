import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CustomerArea from '../CustomerArea'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { MantineProvider } from '@mantine/core'

jest.mock('@/state/game/restaurantStore')

const mockSeat = jest.fn()

const baseState = {
    restaurant: {
        customerCapacity: 4,
        customerQueue: [
            { id: 'c1', patience: 90, status: 'waiting', order: null, arrivalTime: 0, satisfaction: 0, tip: 0 },
        ],
        activeCustomers: [],
        activeOrders: [],
    },
    actions: {
        seatCustomer: mockSeat,
    },
}

    ; (useRestaurantStore as unknown as jest.Mock).mockReturnValue(baseState)

describe('CustomerArea', () => {
    beforeEach(() => {
        mockSeat.mockClear()
    })
    it('renders queue and active tables', () => {
        render(<MantineProvider><CustomerArea /></MantineProvider>)

        expect(screen.getByText('Waiting Queue (1)')).toBeInTheDocument()
        // Seat button exists
        const seatBtn = screen.getByRole('button', { name: /seat/i })
        expect(seatBtn).toBeInTheDocument()
    })

    it('can seat a customer', () => {
        render(<MantineProvider><CustomerArea /></MantineProvider>)
        const seatBtn = screen.getByRole('button', { name: /seat/i })
        fireEvent.click(seatBtn)
        expect(mockSeat).toHaveBeenCalledWith('c1', expect.any(String))
    })
}) 
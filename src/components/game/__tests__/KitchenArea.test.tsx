import React from 'react'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import KitchenArea from '../KitchenArea'
import { useKitchenStore } from '@/state/game/kitchenStore'

jest.mock('@/state/game/kitchenStore')

    ; (useKitchenStore as unknown as jest.Mock).mockReturnValue({
        cookingStations: [
            { id: 's1', type: 'stove', status: 'idle', temperature: 0 },
            { id: 's2', type: 'oven', status: 'busy', temperature: 180 },
        ],
        activeCookingProcesses: [
            { id: 'p1', stationId: 's2', progress: 50, status: 'in_progress', ingredients: [], type: 'bake', startTime: 0, optimalCookingTime: 100 },
        ],
    })

describe('KitchenArea', () => {
    it('renders stations and progress', () => {
        render(<MantineProvider><KitchenArea /></MantineProvider>)
        expect(screen.getByText('s1')).toBeInTheDocument()
        expect(screen.getByText('s2')).toBeInTheDocument()
        // Check badge text for busy status
        expect(screen.getByText('busy')).toBeInTheDocument()
    })
}) 
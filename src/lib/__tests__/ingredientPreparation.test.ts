import { prepareIngredient, completePreparation } from '@/lib/ingredientPreparation'
import { eventBus } from '@/lib/eventBus'
import { PreparationType } from '@/types/models'

// ---------------------------------------------------------------------------
// Mock kitchen store
// ---------------------------------------------------------------------------

jest.mock('@/state/game/kitchenStore', () => {
    const mockKitchenState = {
        prepStations: [
            { id: 'station_1', type: 'cutting_board', status: 'idle' },
            { id: 'station_2', type: 'mixing_bowl', status: 'idle' },
        ],
        activePreparations: {} as any,
        actions: {
            startPreparation: jest.fn((stationId, task) => {
                const station = mockKitchenState.prepStations.find((s) => s.id === stationId)
                if (station) station.status = 'busy'
                mockKitchenState.activePreparations[task.id] = { ...task, status: 'in_progress' }
            }),
            completePreparation: jest.fn((stationId, prepId, quality) => {
                const station = mockKitchenState.prepStations.find((s) => s.id === stationId)
                if (station) station.status = 'idle'
                if (mockKitchenState.activePreparations[prepId]) {
                    mockKitchenState.activePreparations[prepId].status = 'completed'
                    mockKitchenState.activePreparations[prepId].qualityScore = quality
                }
            }),
        },
    }
    return {
        useKitchenStore: {
            getState: jest.fn(() => mockKitchenState),
        },
    }
})

jest.mock('@/lib/eventBus', () => ({ eventBus: { emit: jest.fn() } }))

import { useKitchenStore } from '@/state/game/kitchenStore'

const kitchenState = (useKitchenStore as any).getState()

// ---------------------------------------------------------------------------
describe('Ingredient Preparation System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // reset station statuses
        kitchenState.prepStations.forEach((s: any) => (s.status = 'idle'))
        kitchenState.activePreparations = {}
    })

    it('starts preparation on available station', () => {
        const ingredient = { id: 'ing_1', preparationType: 'chop' as PreparationType }
        const res = prepareIngredient(ingredient, 'cutting_board')
        expect(res.success).toBe(true)
        expect(res.stationId).toBe('station_1')
        expect(kitchenState.actions.startPreparation).toHaveBeenCalled()
        expect(eventBus.emit).toHaveBeenCalledWith('preparationStarted', expect.any(Object))
    })

    it('fails when station unavailable', () => {
        // make cutting board busy
        kitchenState.prepStations[0].status = 'busy'
        const res = prepareIngredient({ id: 'ing_2', preparationType: 'chop' as PreparationType }, 'cutting_board')
        expect(res.success).toBe(false)
        expect(res.message).toMatch(/No available station/)
    })

    it('completes preparation with quality score', () => {
        const ingredient = { id: 'ing_3', preparationType: 'chop' as PreparationType }
        const { preparationId, stationId } = prepareIngredient(ingredient, 'cutting_board')
        const result = completePreparation(stationId!, preparationId!, 90)
        expect(result.success).toBe(true)
        expect(result.qualityScore).toBe(90)
        expect(kitchenState.actions.completePreparation).toHaveBeenCalledWith(stationId, preparationId, 90)
        expect(eventBus.emit).toHaveBeenCalledWith('preparationCompleted', expect.any(Object))
    })
}) 
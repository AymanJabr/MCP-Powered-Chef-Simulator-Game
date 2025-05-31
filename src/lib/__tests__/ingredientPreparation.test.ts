import { prepareIngredient, completePreparation } from '@/lib/ingredientPreparation'
import { eventBus } from '@/lib/eventBus'
import { CookingActionType, PrepStation, PreparationTask } from '@/types/models'

// ---------------------------------------------------------------------------
// Mock kitchen store
// ---------------------------------------------------------------------------

// Define interfaces for the mocked kitchen store actions and state
interface MockKitchenPreparationActions {
    startPreparation: jest.Mock
    completePreparation: jest.Mock
}

interface MockKitchenStateWithPrep {
    prepStations: PrepStation[]
    activePreparations: Record<string, PreparationTask>
    actions: MockKitchenPreparationActions
}

jest.mock('@/state/game/kitchenStore', () => {
    const mockKitchenState: MockKitchenStateWithPrep = {
        prepStations: [
            { id: 'station_1', type: 'cutting_board', status: 'idle' },
            { id: 'station_2', type: 'mixing_bowl', status: 'idle' },
        ],
        activePreparations: {},
        actions: {
            startPreparation: jest.fn((stationId: string, task: Partial<PreparationTask>) => {
                const station = mockKitchenState.prepStations.find((s) => s.id === stationId)
                if (station) station.status = 'busy'
                if (task.id) {
                    mockKitchenState.activePreparations[task.id] = {
                        id: task.id,
                        ingredientId: task.ingredientId || 'unknown_ingredient',
                        type: task.type || 'chop',
                        startTime: task.startTime || Date.now(),
                        stationId: stationId,
                        status: 'in_progress',
                        qualityScore: task.qualityScore
                    } as PreparationTask
                }
            }),
            completePreparation: jest.fn((stationId: string, prepId: string, quality: number) => {
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

// Correctly type the mocked store and its getState method
const mockAppKitchenStore = useKitchenStore
const kitchenState = mockAppKitchenStore.getState()

// ---------------------------------------------------------------------------
describe('Ingredient Preparation System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // reset station statuses
        kitchenState.prepStations.forEach((s: PrepStation) => (s.status = 'idle'))
        kitchenState.activePreparations = {}
    })

    it('starts preparation on available station', () => {
        const ingredient = { id: 'ing_1', type: 'chop' as CookingActionType }
        const res = prepareIngredient(ingredient, 'cutting_board')
        expect(res.success).toBe(true)
        expect(res.stationId).toBe('station_1')
        expect(kitchenState.actions.startPreparation).toHaveBeenCalled()
        const startPreparationMock = kitchenState.actions.startPreparation as jest.Mock
        expect(startPreparationMock.mock.calls[0][1].ingredientId).toBe('ing_1')
        expect(startPreparationMock.mock.calls[0][1].type).toBe('chop')
        expect(eventBus.emit).toHaveBeenCalledWith('preparationStarted', expect.objectContaining({ stationId: 'station_1', ingredientId: 'ing_1', taskId: expect.any(String) }))
    })

    it('fails when station unavailable', () => {
        // make cutting board busy
        if (kitchenState.prepStations[0]) {
            kitchenState.prepStations[0].status = 'busy'
        }
        const res = prepareIngredient({ id: 'ing_2', type: 'chop' as CookingActionType }, 'cutting_board')
        expect(res.success).toBe(false)
        expect(res.message).toMatch(/No available station/)
    })

    it('completes preparation with quality score', () => {
        const ingredient = { id: 'ing_3', type: 'chop' as CookingActionType }
        const { preparationId, stationId } = prepareIngredient(ingredient, 'cutting_board')

        expect(preparationId).toBeDefined()
        expect(stationId).toBeDefined()

        const result = completePreparation(stationId!, preparationId!, 90)
        expect(result.success).toBe(true)
        expect(result.qualityScore).toBe(90)
        expect(kitchenState.actions.completePreparation).toHaveBeenCalledWith(stationId, preparationId, 90)
        expect(eventBus.emit).toHaveBeenCalledWith('preparationCompleted', { taskId: preparationId, quality: 90 })
    })
}) 
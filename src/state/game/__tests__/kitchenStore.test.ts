import { useKitchenStore } from '@/state/game/kitchenStore'
import { PrepStation } from '@/types/models'

describe('Kitchen Store', () => {
    beforeEach(() => {
        // Reset store state completely before each test
        useKitchenStore.setState((state) => {
            state.prepStations = [
                { id: 'station_1', type: 'cutting_board', status: 'idle' },
            ]
            state.activePreparations = {}
        })
    })

    it('initializes with default stations', () => {
        const { prepStations } = useKitchenStore.getState()
        expect(prepStations.length).toBeGreaterThan(0)
    })

    it('adds a new prep station', () => {
        const newStation: PrepStation = { id: 'station_new', type: 'mixing_bowl', status: 'idle' }
        useKitchenStore.getState().actions.addPrepStation(newStation)
        expect(useKitchenStore.getState().prepStations).toContainEqual(newStation)
    })

    it('starts a preparation task and marks station busy', () => {
        const prepId = 'prep_1'
        useKitchenStore.getState().actions.startPreparation('station_1', {
            id: prepId,
            ingredientId: 'ing_1',
            type: 'chop',
            startTime: Date.now(),
            stationId: 'station_1',
        })
        const state = useKitchenStore.getState()
        expect(state.prepStations[0].status).toBe('busy')
        expect(state.activePreparations[prepId]).toBeDefined()
    })

    it('completes preparation and frees station', () => {
        const prepId = 'prep_2'
        const actions = useKitchenStore.getState().actions
        actions.startPreparation('station_1', {
            id: prepId,
            ingredientId: 'ing_2',
            type: 'chop',
            startTime: Date.now(),
            stationId: 'station_1',
        })
        actions.completePreparation('station_1', prepId, 95)
        const state = useKitchenStore.getState()
        expect(state.prepStations[0].status).toBe('idle')
        expect(state.activePreparations[prepId].status).toBe('completed')
        expect(state.activePreparations[prepId].qualityScore).toBe(95)
    })
}) 
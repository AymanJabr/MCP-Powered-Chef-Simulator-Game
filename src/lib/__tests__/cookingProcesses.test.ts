import { checkCookingProgress, completeCooking } from '@/lib/cookingProcesses'
import { eventBus } from '@/lib/eventBus'
import { CookingActionType, CookingProcess, CookingStation } from '@/types/models'

// Define interfaces for the mocked kitchen store
interface MockKitchenStateActions {
    startCookingProcess: jest.Mock
    updateCookingProgress: jest.Mock
    finishCookingProcess: jest.Mock
}

interface MockKitchenState {
    cookingStations: CookingStation[]
    activeCookingProcesses: CookingProcess[]
    actions: MockKitchenStateActions
}

jest.mock('@/state/game/kitchenStore', () => {
    const mockKitchenState: MockKitchenState = {
        cookingStations: [
            { id: 'station_1', type: 'stove', status: 'idle', temperature: 0 },
            { id: 'station_2', type: 'oven', status: 'idle', temperature: 0 },
        ],
        activeCookingProcesses: [],
        actions: {
            startCookingProcess: jest.fn((stationId: string, proc: Partial<CookingProcess>) => {
                // Ensure all required fields of CookingProcess are present
                const fullProc: CookingProcess = {
                    id: proc.id || `proc_${Date.now()}`,
                    stationId,
                    ingredients: proc.ingredients || [],
                    type: proc.type || 'fry',
                    startTime: proc.startTime || Date.now(),
                    optimalCookingTime: proc.optimalCookingTime || 60000,
                    progress: 0,
                    status: 'in_progress',
                    qualityScore: proc.qualityScore
                }
                mockKitchenState.activeCookingProcesses.push(fullProc)
                const st = mockKitchenState.cookingStations.find((s) => s.id === stationId)
                if (st) st.status = 'busy'
            }),
            updateCookingProgress: jest.fn((procId: string, prog: number) => {
                const p = mockKitchenState.activeCookingProcesses.find((c) => c.id === procId)
                if (p) p.progress = prog
            }),
            finishCookingProcess: jest.fn((procId: string, quality: number) => {
                const p = mockKitchenState.activeCookingProcesses.find((c) => c.id === procId)
                if (p) {
                    p.status = 'completed'
                    p.qualityScore = quality
                    const st = mockKitchenState.cookingStations.find((s) => s.id === p.stationId)
                    if (st) st.status = 'idle'
                }
            }),
        },
    }
    return { useKitchenStore: { getState: jest.fn(() => mockKitchenState) } }
})

jest.mock('@/lib/eventBus', () => ({ eventBus: { emit: jest.fn() } }))

import { useKitchenStore } from '@/state/game/kitchenStore'
const mockKitchenStore = useKitchenStore
const kitchenState = mockKitchenStore.getState()

describe('Cooking Processes', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // reset cooking stations and processes
        kitchenState.cookingStations.forEach((s: CookingStation) => (s.status = 'idle'))
        kitchenState.activeCookingProcesses.length = 0
    })

    it('updates progress and completes cooking', () => {
        // To test completeCooking and checkCookingProgress, we need an active process.
        // Since startCooking is removed, we'll manually add a process to the mock store for testing purposes.
        const testProcessId = 'test_proc_123';
        const initialTimestamp = Date.now() - 70000; // 70s ago
        kitchenState.activeCookingProcesses.push({
            id: testProcessId,
            stationId: 'station_2', // Assuming 'station_2' is an oven for 'bake'
            ingredients: [{ id: 'ing_2' }].map(i => i.id),
            type: 'bake' as CookingActionType,
            startTime: initialTimestamp,
            optimalCookingTime: 60000, // 60s
            progress: 0, // Will be calculated by checkCookingProgress
            status: 'in_progress',
        });
        // We also need to ensure the station is marked as busy for some tests, if relevant, but not strictly for these two functions.

        const prog = checkCookingProgress(testProcessId);
        expect(prog).not.toBeNull();
        expect(prog!.progress).toBeGreaterThan(100);

        const res = completeCooking(testProcessId);
        expect(res.success).toBe(true);
        expect(kitchenState.actions.finishCookingProcess).toHaveBeenCalled();
        expect(eventBus.emit).toHaveBeenCalledWith('cookingCompleted', { processId: testProcessId, quality: expect.any(Number) });
    });
}) 
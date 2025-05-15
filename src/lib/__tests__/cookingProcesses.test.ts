import { startCooking, checkCookingProgress, completeCooking } from '@/lib/cookingProcesses'
import { eventBus } from '@/lib/eventBus'
import { CookingMethod } from '@/types/models'

jest.mock('@/state/game/kitchenStore', () => {
    const now = Date.now()
    const mockKitchenState = {
        cookingStations: [
            { id: 'station_1', type: 'stove', status: 'idle', temperature: 0 },
            { id: 'station_2', type: 'oven', status: 'idle', temperature: 0 },
        ],
        activeCookingProcesses: [] as any[],
        actions: {
            startCookingProcess: jest.fn((stationId: string, proc: any) => {
                mockKitchenState.activeCookingProcesses.push({ ...proc, stationId, progress: 0, status: 'in_progress' })
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
const kitchenState = (useKitchenStore as any).getState()

describe('Cooking Processes', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // reset cooking stations and processes
        kitchenState.cookingStations.forEach((s: any) => (s.status = 'idle'))
        kitchenState.activeCookingProcesses.length = 0
    })

    it('starts cooking on a free station', () => {
        const result = startCooking([{ id: 'ing_1' }], 'fry' as CookingMethod)
        expect(result.success).toBe(true)
        expect(kitchenState.actions.startCookingProcess).toHaveBeenCalled()
        expect(eventBus.emit).toHaveBeenCalledWith('cookingStarted', expect.any(Object))
    })

    it('fails when no station available', () => {
        kitchenState.cookingStations.forEach((s: any) => (s.status = 'busy'))
        const res = startCooking([{ id: 'ing_1' }], 'fry' as CookingMethod)
        expect(res.success).toBe(false)
    })

    it('updates progress and completes cooking', () => {
        const { cookingId } = startCooking([{ id: 'ing_2' }], 'bake' as CookingMethod)
        // simulate time passage by manipulating startTime
        const proc = kitchenState.activeCookingProcesses[0]
        proc.startTime -= 70000 // 70s ago
        const prog = checkCookingProgress(cookingId!)
        expect(prog).not.toBeNull()
        expect(prog!.progress).toBeGreaterThan(100)

        const res = completeCooking(cookingId!)
        expect(res.success).toBe(true)
        expect(kitchenState.actions.finishCookingProcess).toHaveBeenCalled()
        expect(eventBus.emit).toHaveBeenCalledWith('cookingCompleted', expect.any(Object))
    })
}) 
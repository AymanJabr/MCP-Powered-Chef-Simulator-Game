import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { PrepStation, PreparationTask, CookingStation, CookingProcess, PlatingStation, PlatingTask, CookingActionType } from '@/types/models'

// Basic types for kitchen elements used in preparation system
export interface KitchenState {
    prepStations: PrepStation[]
    cookingStations: CookingStation[]
    activePreparations: Record<string, PreparationTask> // key = preparationId
    activeCookingProcesses: CookingProcess[]
    platingStations: PlatingStation[]
    activePlating: Record<string, PlatingTask>
    actions: {
        startPreparation: (stationId: string, task: Omit<PreparationTask, 'status' | 'qualityScore'>) => void
        completePreparation: (stationId: string, preparationId: string, qualityScore: number) => void
        addPrepStation: (station: PrepStation) => void
        startCookingProcess: (stationId: string, process: Omit<CookingProcess, 'status' | 'progress' | 'qualityScore'>) => string
        updateCookingProgress: (processId: string, progress: number, overcooked: boolean) => void
        finishCookingProcess: (processId: string, qualityScore: number) => void
        startPlating: (stationId: string, orderId: string, platingId: string) => void
        addItemToPlate: (platingId: string, itemId: string) => void
        addGarnishToPlate: (platingId: string, garnishId: string) => void
        completePlating: (platingId: string, qualityScore: number) => void
    }
}

export const useKitchenStore = create<KitchenState>()(
    immer((set) => ({
        prepStations: [
            { id: 'station_1', type: 'cutting_board', status: 'idle' },
            { id: 'station_2', type: 'mixing_bowl', status: 'busy' },
            { id: 'station_3', type: 'blender', status: 'idle' },
            { id: 'station_4', type: 'mortar_pestle', status: 'idle' },
        ],
        cookingStations: [
            { id: 'cook_1', type: 'stove', status: 'busy', temperature: 180 },
            { id: 'cook_2', type: 'oven', status: 'idle', temperature: 0 },
            { id: 'cook_3', type: 'grill', status: 'busy', temperature: 220 },
            { id: 'cook_4', type: 'fryer', status: 'idle', temperature: 0 },
            { id: 'cook_5', type: 'steamer', status: 'idle', temperature: 100 },
        ],
        activePreparations: {},
        activeCookingProcesses: [
            // Add some demo cooking processes
            {
                id: 'cooking_demo_001',
                stationId: 'cook_1',
                ingredients: ['beef_patty'],
                type: 'fry',
                startTime: Date.now() - 60000, // Started 1 minute ago
                optimalCookingTime: 120000, // 2 minutes total
                progress: 50, // Half done
                status: 'in_progress' as const
            },
            {
                id: 'cooking_demo_002',
                stationId: 'cook_3',
                ingredients: ['chicken_breast'],
                type: 'grill',
                startTime: Date.now() - 90000, // Started 1.5 minutes ago
                optimalCookingTime: 180000, // 3 minutes total
                progress: 80, // Almost done
                status: 'in_progress' as const
            }
        ],
        platingStations: [
            { id: 'plating_1', status: 'idle' },
            { id: 'plating_2', status: 'busy' }
        ],
        activePlating: {},
        actions: {
            addPrepStation: (station) => set((state) => {
                state.prepStations.push(station)
            }),
            startPreparation: (stationId, task) => set((state) => {
                const station = state.prepStations.find((s) => s.id === stationId)
                if (!station) return


                station.status = 'busy'
                state.activePreparations[task.id] = { ...task, status: 'in_progress' }
            }),
            completePreparation: (stationId, preparationId, qualityScore) => set((state) => {
                const station = state.prepStations.find((s) => s.id === stationId)
                if (station) station.status = 'idle'
                if (state.activePreparations[preparationId]) {
                    state.activePreparations[preparationId].status = 'completed'
                    state.activePreparations[preparationId].qualityScore = qualityScore
                }
            }),
            startCookingProcess: (stationId, process) => {
                const id = process.id
                set((state) => {
                    state.activeCookingProcesses.push({
                        ...process,
                        stationId,
                        progress: 0,
                        status: 'in_progress',
                    })
                    const station = state.cookingStations.find((s) => s.id === stationId)
                    if (station) station.status = 'busy'
                })
                return id
            },
            updateCookingProgress: (processId, progress, overcooked) => set((state) => {
                const proc = state.activeCookingProcesses.find((p) => p.id === processId)
                if (proc) {
                    proc.progress = progress
                    if (overcooked) proc.status = 'failed'
                }
            }),
            finishCookingProcess: (processId, qualityScore) => set((state) => {
                const procIndex = state.activeCookingProcesses.findIndex((p) => p.id === processId)
                if (procIndex !== -1) {
                    const proc = state.activeCookingProcesses[procIndex]
                    proc.status = 'completed'
                    proc.qualityScore = qualityScore
                    const station = state.cookingStations.find((s) => s.id === proc.stationId)
                    if (station) station.status = 'idle'
                }
            }),
            startPlating: (stationId, orderId, platingId) => set((state) => {
                const st = state.platingStations.find((s) => s.id === stationId)
                if (!st || st.status === 'busy') return
                st.status = 'busy'
                state.activePlating[platingId] = {
                    id: platingId,
                    stationId,
                    orderId,
                    items: [],
                    garnishes: [],
                    startTime: Date.now(),
                    status: 'in_progress',
                }
            }),
            addItemToPlate: (platingId, itemId) => set((state) => {
                const p = state.activePlating[platingId]
                if (p && !p.items.includes(itemId)) p.items.push(itemId)
            }),
            addGarnishToPlate: (platingId, garnishId) => set((state) => {
                const p = state.activePlating[platingId]
                if (p && !p.garnishes.includes(garnishId)) p.garnishes.push(garnishId)
            }),
            completePlating: (platingId, qualityScore) => set((state) => {
                const p = state.activePlating[platingId]
                if (!p) return
                p.status = 'completed'
                p.qualityScore = qualityScore
                const st = state.platingStations.find((s) => s.id === p.stationId)
                if (st) st.status = 'idle'
            }),
        },
    }))
) 
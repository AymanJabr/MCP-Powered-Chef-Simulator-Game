import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { PrepStation, PreparationTask, CookingStation, CookingProcess } from '@/types/models'

// Basic types for kitchen elements used in preparation system
export interface KitchenState {
    prepStations: PrepStation[]
    cookingStations: CookingStation[]
    activePreparations: Record<string, PreparationTask> // key = preparationId
    activeCookingProcesses: CookingProcess[]
    actions: {
        startPreparation: (stationId: string, task: Omit<PreparationTask, 'status' | 'qualityScore'>) => void
        completePreparation: (stationId: string, preparationId: string, qualityScore: number) => void
        addPrepStation: (station: PrepStation) => void
        startCookingProcess: (stationId: string, process: Omit<CookingProcess, 'status' | 'progress' | 'qualityScore'>) => string
        updateCookingProgress: (processId: string, progress: number, overcooked: boolean) => void
        finishCookingProcess: (processId: string, qualityScore: number) => void
    }
}

export const useKitchenStore = create<KitchenState>()(
    immer((set) => ({
        prepStations: [
            { id: 'station_1', type: 'cutting_board', status: 'idle' },
            { id: 'station_2', type: 'mixing_bowl', status: 'idle' },
        ],
        cookingStations: [
            { id: 'cook_1', type: 'stove', status: 'idle', temperature: 0 },
            { id: 'cook_2', type: 'oven', status: 'idle', temperature: 0 },
        ],
        activePreparations: {},
        activeCookingProcesses: [],
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
        },
    }))
) 
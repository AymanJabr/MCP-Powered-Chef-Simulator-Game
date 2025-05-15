import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { PrepStation, PreparationTask } from '@/types/models'

// Basic types for kitchen elements used in preparation system
export interface KitchenState {
    prepStations: PrepStation[]
    activePreparations: Record<string, PreparationTask> // key = preparationId
    actions: {
        startPreparation: (stationId: string, task: Omit<PreparationTask, 'status' | 'qualityScore'>) => void
        completePreparation: (stationId: string, preparationId: string, qualityScore: number) => void
        addPrepStation: (station: PrepStation) => void
    }
}

export const useKitchenStore = create<KitchenState>()(
    immer((set) => ({
        prepStations: [
            { id: 'station_1', type: 'cutting_board', status: 'idle' },
            { id: 'station_2', type: 'mixing_bowl', status: 'idle' },
        ],
        activePreparations: {},
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
        },
    }))
) 
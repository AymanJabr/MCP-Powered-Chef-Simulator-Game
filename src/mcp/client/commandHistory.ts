import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface HistoricalCommand {
    id: string
    commandText: string
    timestamp: number
}

interface CommandHistoryState {
    history: HistoricalCommand[]
    actions: {
        add: (cmd: string) => string
        clear: () => void
        load: () => void
    }
}

const STORAGE_KEY = 'commandHistory'

export const useCommandHistoryStore = create<CommandHistoryState>()(
    immer((set) => ({
        history: [],
        actions: {
            load: () => set((state) => {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY)
                    state.history = raw ? JSON.parse(raw) : []
                } catch { state.history = [] }
            }),
            add: (cmd) => {
                const id = `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
                const entry: HistoricalCommand = { id, commandText: cmd, timestamp: Date.now() }
                set((state) => {
                    state.history.unshift(entry)
                    if (state.history.length > 100) { state.history.pop() }
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history))
                })
                return id
            },
            clear: () => set((state) => {
                state.history = []
                localStorage.removeItem(STORAGE_KEY)
            })
        }
    }))
) 
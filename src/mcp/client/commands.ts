import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { SavedCommand } from '@/types/models'

interface CommandsState {
    savedCommands: SavedCommand[]
    suggestedCommands: SavedCommand[]
    actions: {
        loadSavedCommands: () => void
        saveCommand: (cmd: Omit<SavedCommand, 'id'>) => string
        deleteCommand: (id: string) => void
        clearAll: () => void
    }
}

const DEFAULT_SUGGESTED: SavedCommand[] = [
    { id: 'suggest_1', name: 'Take All Orders', command: 'Take orders from all waiting customers', tags: ['orders'] },
    { id: 'suggest_2', name: 'Cook Prepared', command: 'Cook all prepared ingredients', tags: ['cooking'] },
    { id: 'suggest_3', name: 'Serve Ready', command: 'Serve all completed dishes', tags: ['service'] }
]

const STORAGE_KEY = 'savedCommands'

export const useCommandsStore = create<CommandsState>()(
    immer((set) => ({
        savedCommands: [],
        suggestedCommands: DEFAULT_SUGGESTED,
        actions: {
            loadSavedCommands: () => set((state) => {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY)
                    if (raw) {
                        state.savedCommands = JSON.parse(raw)
                    }
                } catch {
                    state.savedCommands = []
                }
            }),
            saveCommand: (cmd) => {
                const id = `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
                set((state) => {
                    state.savedCommands.push({ ...cmd, id })
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedCommands))
                })
                return id
            },
            deleteCommand: (id) => set((state) => {
                state.savedCommands = state.savedCommands.filter(c => c.id !== id)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedCommands))
            }),
            clearAll: () => set((state) => {
                state.savedCommands = []
                localStorage.removeItem(STORAGE_KEY)
            })
        }
    }))
) 
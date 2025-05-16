import { useCommandsStore } from '../commands'

// Mock browser localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: jest.fn((key: string) => store[key] ?? null),
        setItem: jest.fn((key: string, value: string) => { store[key] = value }),
        removeItem: jest.fn((key: string) => { delete store[key] }),
        clear: jest.fn(() => { store = {} })
    }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Commands Store', () => {
    beforeEach(() => {
        localStorageMock.clear()
        // reset Zustand state
        useCommandsStore.setState({ savedCommands: [], suggestedCommands: useCommandsStore.getState().suggestedCommands })
    })

    it('initialises with default suggested commands', () => {
        const { suggestedCommands } = useCommandsStore.getState()
        expect(suggestedCommands.length).toBeGreaterThan(0)
    })

    it('loads saved commands from localStorage', () => {
        const sample = [{ id: 'saved1', name: 'Quick', command: 'test', tags: [] }]
        localStorageMock.setItem('savedCommands', JSON.stringify(sample))
        useCommandsStore.getState().actions.loadSavedCommands()
        expect(useCommandsStore.getState().savedCommands).toEqual(sample)
    })

    it('saveCommand persists to store and localStorage', () => {
        const id = useCommandsStore.getState().actions.saveCommand({ name: 'Do', command: 'something', tags: [] })
        const { savedCommands } = useCommandsStore.getState()
        expect(savedCommands.find(c => c.id === id)).toBeDefined()
        expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('deleteCommand removes from store and localStorage', () => {
        const id = useCommandsStore.getState().actions.saveCommand({ name: 'Remove', command: 'me', tags: [] })
        useCommandsStore.getState().actions.deleteCommand(id)
        expect(useCommandsStore.getState().savedCommands.find(c => c.id === id)).toBeUndefined()
    })

    it('clearAll wipes saved commands', () => {
        useCommandsStore.getState().actions.saveCommand({ name: 'One', command: 'a', tags: [] })
        useCommandsStore.getState().actions.clearAll()
        expect(useCommandsStore.getState().savedCommands.length).toBe(0)
        expect(localStorageMock.removeItem).toHaveBeenCalled()
    })
}) 
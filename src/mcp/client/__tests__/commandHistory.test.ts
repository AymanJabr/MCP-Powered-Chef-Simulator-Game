import { useCommandHistoryStore } from '../commandHistory'

const lsMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: jest.fn((k) => store[k] || null),
        setItem: jest.fn((k, v) => { store[k] = v }),
        removeItem: jest.fn((k) => { delete store[k] }),
        clear: () => { store = {} }
    }
})()
Object.defineProperty(window, 'localStorage', { value: lsMock })

describe('CommandHistory Store', () => {
    beforeEach(() => {
        lsMock.clear()
        useCommandHistoryStore.setState({ history: [] })
    })
    it('adds entry and persists', () => {
        const id = useCommandHistoryStore.getState().actions.add('hello')
        const entry = useCommandHistoryStore.getState().history.find(h => h.id === id)
        expect(entry?.commandText).toBe('hello')
        expect(lsMock.setItem).toHaveBeenCalled()
    })
    it('loads from localStorage', () => {
        const sample = [{ id: 'h1', commandText: 'cmd', timestamp: 1 }]
        lsMock.setItem('commandHistory', JSON.stringify(sample))
        useCommandHistoryStore.getState().actions.load()
        expect(useCommandHistoryStore.getState().history).toEqual(sample)
    })
    it('clear empties history', () => {
        useCommandHistoryStore.getState().actions.add('x')
        useCommandHistoryStore.getState().actions.clear()
        expect(useCommandHistoryStore.getState().history.length).toBe(0)
        expect(lsMock.removeItem).toHaveBeenCalled()
    })
}) 
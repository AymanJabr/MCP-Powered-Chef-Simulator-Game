import { useGameStore } from '../gameStore'

describe('Game Store', () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        useGameStore.getState().actions.resetGame()
    })

    it('should initialize with default values', () => {
        const state = useGameStore.getState()
        expect(state.gameMode).toBe('manual')
        expect(state.difficulty).toBe(1)
        expect(state.timeElapsed).toBe(0)
        expect(state.isPaused).toBe(false)
        expect(state.gamePhase).toBe('preGame')
    })

    it('should set game mode correctly', () => {
        const { actions } = useGameStore.getState()
        actions.setGameMode('mcp')
        expect(useGameStore.getState().gameMode).toBe('mcp')
    })

    it('should increase time and difficulty', () => {
        const { actions } = useGameStore.getState()

        // Increase by 60 seconds to trigger difficulty increase
        actions.increaseTime(60)

        const state = useGameStore.getState()
        expect(state.timeElapsed).toBe(60)
        expect(state.difficulty).toBeCloseTo(1.1)
    })

    it('should toggle pause state', () => {
        const { actions } = useGameStore.getState()
        const initialPauseState = useGameStore.getState().isPaused

        actions.togglePause()
        expect(useGameStore.getState().isPaused).toBe(!initialPauseState)

        actions.togglePause()
        expect(useGameStore.getState().isPaused).toBe(initialPauseState)
    })

    it('should reset the game state', () => {
        const { actions } = useGameStore.getState()

        // Modify state
        actions.setGameMode('mcp')
        actions.increaseTime(120)

        // Reset
        actions.resetGame()

        const state = useGameStore.getState()
        expect(state.timeElapsed).toBe(0)
        expect(state.difficulty).toBe(1)
        expect(state.gamePhase).toBe('preGame')

        // gameMode should not be reset as it's a user preference
        expect(state.gameMode).toBe('mcp')
    })

    it('should set difficulty correctly', () => {
        const { actions } = useGameStore.getState()
        actions.setDifficulty(5)
        expect(useGameStore.getState().difficulty).toBe(5)
    })
}) 
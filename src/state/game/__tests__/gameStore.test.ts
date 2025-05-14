import { useGameStore } from '../gameStore'

describe('Game Store', () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        useGameStore.getState().actions.resetGame()
    })

    it('should initialize with default values', () => {
        const { game } = useGameStore.getState()
        expect(game.gameMode).toBe('manual')
        expect(game.difficulty).toBe(1)
        expect(game.timeElapsed).toBe(0)
        expect(game.isPaused).toBe(false)
        expect(game.gamePhase).toBe('preGame')
    })

    it('should set game mode correctly', () => {
        const { actions } = useGameStore.getState()
        actions.setGameMode('mcp')
        expect(useGameStore.getState().game.gameMode).toBe('mcp')
    })

    it('should increase time and difficulty', () => {
        const { actions } = useGameStore.getState()

        // Increase by 60 seconds to trigger difficulty increase
        actions.increaseTime(60)

        const { game } = useGameStore.getState()
        expect(game.timeElapsed).toBe(60)
        expect(game.difficulty).toBeCloseTo(1.1)
    })

    it('should toggle pause state', () => {
        const { actions } = useGameStore.getState()
        const initialPauseState = useGameStore.getState().game.isPaused

        actions.togglePause()
        expect(useGameStore.getState().game.isPaused).toBe(!initialPauseState)

        actions.togglePause()
        expect(useGameStore.getState().game.isPaused).toBe(initialPauseState)
    })

    it('should reset the game state', () => {
        const { actions } = useGameStore.getState()

        // Modify state
        actions.setGameMode('mcp')
        actions.increaseTime(120)

        // Reset
        actions.resetGame()

        const { game } = useGameStore.getState()
        expect(game.timeElapsed).toBe(0)
        expect(game.difficulty).toBe(1)
        expect(game.gamePhase).toBe('preGame')

        // gameMode should not be reset as it's a user preference
        expect(game.gameMode).toBe('mcp')
    })

    it('should set difficulty correctly', () => {
        const { actions } = useGameStore.getState()
        actions.setDifficulty(5)
        expect(useGameStore.getState().game.difficulty).toBe(5)
    })
}) 
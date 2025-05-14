import { usePlayerStore } from '../playerStore'
import { Position, SavedCommand } from '@/types/models'

// Mock Date.now to return a consistent value for testing
const originalDateNow = Date.now
const mockNow = 1619784000000 // May 1, 2021

describe('Player Store', () => {
    beforeAll(() => {
        // Mock Date.now
        Date.now = jest.fn(() => mockNow)
    })

    afterAll(() => {
        // Restore original Date.now
        Date.now = originalDateNow
    })

    beforeEach(() => {
        // Reset store to a completely new state before each test
        usePlayerStore.setState({
            player: {
                id: `player_${Date.now()}`,
                name: 'Chef',
                score: 0,
                speed: 1,
                skill: 1,
                position: {
                    x: 0,
                    y: 0,
                    area: 'kitchen'
                },
                currentAction: null,
                actionQueue: [],
                actionHistory: [],
                savedCommands: []
            }
        })
    })

    it('should initialize with default values', () => {
        const { player } = usePlayerStore.getState()

        expect(player.name).toBe('Chef')
        expect(player.score).toBe(0)
        expect(player.speed).toBe(1)
        expect(player.skill).toBe(1)
        expect(player.position).toEqual({ x: 0, y: 0, area: 'kitchen' })
        expect(player.currentAction).toBeNull()
        expect(player.actionQueue).toEqual([])
        expect(player.actionHistory).toEqual([])
        expect(player.savedCommands).toEqual([])
    })

    it('should set player name', () => {
        const { actions } = usePlayerStore.getState()

        actions.setName('Master Chef')

        expect(usePlayerStore.getState().player.name).toBe('Master Chef')
    })

    it('should set player position', () => {
        const { actions } = usePlayerStore.getState()
        const newPosition: Position = { x: 10, y: 15, area: 'dining' }

        actions.setPosition(newPosition)

        expect(usePlayerStore.getState().player.position).toEqual(newPosition)
    })

    it('should add to player score', () => {
        const { actions } = usePlayerStore.getState()

        actions.addScore(10)
        expect(usePlayerStore.getState().player.score).toBe(10)

        actions.addScore(5)
        expect(usePlayerStore.getState().player.score).toBe(15)
    })

    it('should start an action', () => {
        const { actions } = usePlayerStore.getState()
        const actionId = actions.startAction('cook', 'ingredient_1', 5000)

        const { player } = usePlayerStore.getState()

        expect(actionId).toBeDefined()
        expect(player.currentAction).not.toBeNull()
        expect(player.currentAction?.type).toBe('cook')
        expect(player.currentAction?.target).toBe('ingredient_1')
        expect(player.currentAction?.startTime).toBe(mockNow)
        expect(player.currentAction?.duration).toBe(5000)
        expect(player.currentAction?.status).toBe('in_progress')
    })

    it('should queue an action', () => {
        const { actions } = usePlayerStore.getState()
        const actionId = actions.queueAction('prepare_ingredient', 'ingredient_2', 3000)

        const { player } = usePlayerStore.getState()

        expect(actionId).toBeDefined()
        expect(player.actionQueue).toHaveLength(1)
        expect(player.actionQueue[0].type).toBe('prepare_ingredient')
        expect(player.actionQueue[0].target).toBe('ingredient_2')
        expect(player.actionQueue[0].startTime).toBe(0) // Not started yet
        expect(player.actionQueue[0].duration).toBe(3000)
        expect(player.actionQueue[0].status).toBe('queued')
    })

    it('should complete the current action successfully', () => {
        const { actions } = usePlayerStore.getState()

        // Start an action
        const actionId = actions.startAction('cook', 'ingredient_1', 5000)

        // Complete it successfully
        actions.completeAction(actionId, true)

        const { player } = usePlayerStore.getState()

        // Current action should be null
        expect(player.currentAction).toBeNull()

        // Action should be in history
        expect(player.actionHistory).toHaveLength(1)
        expect(player.actionHistory[0].id).toBe(actionId)
        expect(player.actionHistory[0].status).toBe('completed')
        expect(player.actionHistory[0].completionTime).toBe(mockNow)
    })

    it('should complete the current action with failure', () => {
        const { actions } = usePlayerStore.getState()

        // Start an action
        const actionId = actions.startAction('cook', 'ingredient_1', 5000)

        // Complete it with failure
        actions.completeAction(actionId, false)

        const { player } = usePlayerStore.getState()

        // Action should be in history
        expect(player.actionHistory).toHaveLength(1)
        expect(player.actionHistory[0].status).toBe('failed')
    })

    it('should start the next queued action after completing current action', () => {
        const { actions } = usePlayerStore.getState()

        // Start an action
        const action1Id = actions.startAction('cook', 'ingredient_1', 5000)

        // Queue another action
        const action2Id = actions.queueAction('serve', 'customer_1', 2000)

        // Complete the first action
        actions.completeAction(action1Id, true)

        const { player } = usePlayerStore.getState()

        // Queue should be empty now
        expect(player.actionQueue).toHaveLength(0)

        // Current action should be the previously queued action
        expect(player.currentAction).not.toBeNull()
        expect(player.currentAction?.id).toBe(action2Id)
        expect(player.currentAction?.status).toBe('in_progress')
        expect(player.currentAction?.startTime).toBe(mockNow)
    })

    it('should cancel the current action', () => {
        const { actions } = usePlayerStore.getState()

        // Start an action
        const actionId = actions.startAction('cook', 'ingredient_1', 5000)

        // Cancel it
        actions.cancelAction(actionId)

        const { player } = usePlayerStore.getState()

        // Current action should be null
        expect(player.currentAction).toBeNull()

        // Action should not be in history
        expect(player.actionHistory).toHaveLength(0)
    })

    it('should cancel a queued action', () => {
        const { actions } = usePlayerStore.getState()

        // Queue an action
        const actionId = actions.queueAction('prepare_ingredient', 'ingredient_2', 3000)

        // Cancel it
        actions.cancelAction(actionId)

        const { player } = usePlayerStore.getState()

        // Queue should be empty
        expect(player.actionQueue).toHaveLength(0)
    })

    it('should clear the action queue', () => {
        const { actions } = usePlayerStore.getState()

        // Queue multiple actions
        actions.queueAction('prepare_ingredient', 'ingredient_1', 3000)
        actions.queueAction('cook', 'ingredient_1', 5000)
        actions.queueAction('serve', 'customer_1', 2000)

        // Check queue has actions
        expect(usePlayerStore.getState().player.actionQueue).toHaveLength(3)

        // Clear queue
        actions.clearActionQueue()

        // Queue should be empty
        expect(usePlayerStore.getState().player.actionQueue).toHaveLength(0)
    })

    it('should move player to a specific area', () => {
        const { actions } = usePlayerStore.getState()

        actions.moveToArea('storage', 20, 30)

        const { player } = usePlayerStore.getState()

        expect(player.position).toEqual({
            area: 'storage',
            x: 20,
            y: 30
        })
    })

    it('should save a command', () => {
        const { actions } = usePlayerStore.getState()

        const command: Omit<SavedCommand, 'id'> = {
            name: 'Quick Cook',
            command: 'Cook all prepared ingredients',
            tags: ['cooking', 'efficiency']
        }

        const commandId = actions.saveCommand(command)

        const { player } = usePlayerStore.getState()

        expect(commandId).toBeDefined()
        expect(player.savedCommands).toHaveLength(1)
        expect(player.savedCommands[0].name).toBe('Quick Cook')
        expect(player.savedCommands[0].command).toBe('Cook all prepared ingredients')
        expect(player.savedCommands[0].tags).toEqual(['cooking', 'efficiency'])
    })

    it('should delete a saved command', () => {
        const { actions } = usePlayerStore.getState()

        // Save a command
        const commandId = actions.saveCommand({
            name: 'Quick Cook',
            command: 'Cook all prepared ingredients',
            tags: ['cooking']
        })

        // Check it was saved
        expect(usePlayerStore.getState().player.savedCommands).toHaveLength(1)

        // Delete it
        actions.deleteCommand(commandId)

        // Check it was deleted
        expect(usePlayerStore.getState().player.savedCommands).toHaveLength(0)
    })

    it('should limit action history to 20 items', () => {
        const { actions } = usePlayerStore.getState()

        // Add 25 actions to history
        for (let i = 0; i < 25; i++) {
            const actionId = actions.startAction('cook', `ingredient_${i}`, 1000)
            actions.completeAction(actionId, true)
        }

        const { player } = usePlayerStore.getState()

        // History should be limited to 20 items
        expect(player.actionHistory).toHaveLength(20)

        // The most recent actions should be at the beginning (index 0)
        expect(player.actionHistory[0].target).toBe('ingredient_24')
        expect(player.actionHistory[19].target).toBe('ingredient_5')
    })

    it('should reset player state but keep saved commands', () => {
        const { actions } = usePlayerStore.getState()

        // Set up some player state
        actions.setName('Master Chef')
        actions.addScore(100)
        actions.moveToArea('dining', 50, 60)
        actions.startAction('cook', 'ingredient_1', 5000)
        actions.queueAction('serve', 'customer_1', 2000)

        // Complete an action to add to history
        const actionId = actions.startAction('prepare_ingredient', 'ingredient_2', 3000)
        actions.completeAction(actionId, true)

        // Save a command
        actions.saveCommand({
            name: 'Test Command',
            command: 'Test',
            tags: ['test']
        })

        // Reset player
        actions.resetPlayer()

        const { player } = usePlayerStore.getState()

        // Name should not be reset
        expect(player.name).toBe('Master Chef')

        // Score should be reset
        expect(player.score).toBe(0)

        // Position should be reset
        expect(player.position).toEqual({ x: 0, y: 0, area: 'kitchen' })

        // Actions should be reset
        expect(player.currentAction).toBeNull()
        expect(player.actionQueue).toHaveLength(0)
        expect(player.actionHistory).toHaveLength(0)

        // Saved commands should be kept (only the one we added)
        expect(player.savedCommands).toHaveLength(1)
        expect(player.savedCommands[0].name).toBe('Test Command')
    })
}) 
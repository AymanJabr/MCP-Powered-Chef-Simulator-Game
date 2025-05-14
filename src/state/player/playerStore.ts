import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Player, PlayerAction, Position, SavedCommand, PlayerActionType } from '@/types/models'

interface PlayerState {
    player: Player
    actions: {
        setName: (name: string) => void
        setPosition: (position: Position) => void
        addScore: (points: number) => void
        startAction: (actionType: PlayerActionType, targetId: string, duration: number) => string
        queueAction: (actionType: PlayerActionType, targetId: string, duration: number) => string
        completeAction: (actionId: string, success: boolean) => void
        cancelAction: (actionId: string) => void
        clearActionQueue: () => void
        moveToArea: (area: Position['area'], x: number, y: number) => void
        saveCommand: (command: Omit<SavedCommand, 'id'>) => string
        deleteCommand: (commandId: string) => void
        resetPlayer: () => void
    }
}

export const usePlayerStore = create<PlayerState>()(
    immer((set) => ({
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
        },
        actions: {
            setName: (name) => set((state) => {
                state.player.name = name
            }),

            setPosition: (position) => set((state) => {
                state.player.position = position
            }),

            addScore: (points) => set((state) => {
                state.player.score += points
            }),

            startAction: (actionType, targetId, duration) => {
                const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

                set((state) => {
                    // Create the new action
                    const newAction: PlayerAction = {
                        id: actionId,
                        type: actionType,
                        target: targetId,
                        startTime: Date.now(),
                        duration,
                        status: 'in_progress',
                        completionTime: null
                    }

                    // Set as current action
                    state.player.currentAction = newAction
                })

                return actionId
            },

            queueAction: (actionType, targetId, duration) => {
                const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

                set((state) => {
                    // Create the new action
                    const newAction: PlayerAction = {
                        id: actionId,
                        type: actionType,
                        target: targetId,
                        startTime: 0, // Will be set when action starts
                        duration,
                        status: 'queued',
                        completionTime: null
                    }

                    // Add to action queue
                    state.player.actionQueue.push(newAction)
                })

                return actionId
            },

            completeAction: (actionId, success) => set((state) => {
                // Check if it's the current action
                if (state.player.currentAction && state.player.currentAction.id === actionId) {
                    // Update status based on success
                    state.player.currentAction.status = success ? 'completed' : 'failed'
                    state.player.currentAction.completionTime = Date.now()

                    // Add to action history
                    state.player.actionHistory.unshift(state.player.currentAction)

                    // Limit history size
                    if (state.player.actionHistory.length > 20) {
                        state.player.actionHistory.pop()
                    }

                    // Clear current action
                    state.player.currentAction = null

                    // Start next action from queue if available
                    if (state.player.actionQueue.length > 0) {
                        const nextAction = state.player.actionQueue.shift()!
                        nextAction.status = 'in_progress'
                        nextAction.startTime = Date.now()
                        state.player.currentAction = nextAction
                    }
                } else {
                    // Check in the queue
                    const actionIndex = state.player.actionQueue.findIndex(
                        (action) => action.id === actionId
                    )

                    if (actionIndex !== -1) {
                        const action = state.player.actionQueue[actionIndex]
                        action.status = success ? 'completed' : 'failed'
                        action.completionTime = Date.now()

                        // Add to history
                        state.player.actionHistory.unshift(action)

                        // Limit history size
                        if (state.player.actionHistory.length > 20) {
                            state.player.actionHistory.pop()
                        }

                        // Remove from queue
                        state.player.actionQueue.splice(actionIndex, 1)
                    }
                }
            }),

            cancelAction: (actionId) => set((state) => {
                // Check if it's the current action
                if (state.player.currentAction && state.player.currentAction.id === actionId) {
                    // Clear current action
                    state.player.currentAction = null

                    // Start next action from queue if available
                    if (state.player.actionQueue.length > 0) {
                        const nextAction = state.player.actionQueue.shift()!
                        nextAction.status = 'in_progress'
                        nextAction.startTime = Date.now()
                        state.player.currentAction = nextAction
                    }
                } else {
                    // Remove from the queue
                    state.player.actionQueue = state.player.actionQueue.filter(
                        (action) => action.id !== actionId
                    )
                }
            }),

            clearActionQueue: () => set((state) => {
                state.player.actionQueue = []
            }),

            moveToArea: (area, x, y) => set((state) => {
                state.player.position = { area, x, y }
            }),

            saveCommand: (command) => {
                const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

                set((state) => {
                    state.player.savedCommands.push({
                        id: commandId,
                        ...command
                    })
                })

                return commandId
            },

            deleteCommand: (commandId) => set((state) => {
                state.player.savedCommands = state.player.savedCommands.filter(
                    (cmd) => cmd.id !== commandId
                )
            }),

            resetPlayer: () => set((state) => {
                state.player = {
                    ...state.player,
                    score: 0,
                    position: {
                        x: 0,
                        y: 0,
                        area: 'kitchen'
                    },
                    currentAction: null,
                    actionQueue: [],
                    actionHistory: []
                    // Note: We're not resetting savedCommands as those should persist
                }
            })
        }
    }))
) 
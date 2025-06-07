import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
    Player, PlayerAction, Position, SavedCommand, PlayerActionType,
    PlayerDirection, ChefAnimationType, ChefSpriteConfig
} from '@/types/models'
import { chefSpriteConfig } from '@/config/chefAnimations'

interface PlayerState {
    player: Player
    isCarryingItem: boolean
    actions: {
        setName: (name: string) => void
        setPosition: (position: Position, oldPosition?: Position) => void
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
        _updateAnimationState: () => void
        setPlayerDirection: (direction: PlayerDirection) => void
        setCarryingItem: (isCarrying: boolean) => void
        setDirection: (direction: PlayerDirection) => void
        setAnimationState: (animationState: ChefAnimationType) => void
        loadSpriteConfig: (config: ChefSpriteConfig) => void
    }
}

const defaultPlayerPosition: Position = {
    x: 0,
    y: 0,
    area: 'kitchen'
}

export const usePlayerStore = create<PlayerState>()(
    immer((set, get) => ({
        player: {
            id: `player_${Date.now()}`,
            name: 'Chef',
            score: 0,
            speed: 1,
            skill: 1,
            position: defaultPlayerPosition,
            currentAction: null,
            actionQueue: [],
            actionHistory: [],
            savedCommands: [],
            direction: 'down',
            animationState: 'idle',
            spriteConfig: chefSpriteConfig,
        } as Player,
        isCarryingItem: false,
        actions: {
            setName: (name) => set((state) => {
                state.player.name = name
            }),
            setPosition: (newPosition, oldPosition) => set((state) => {
                const prevPos = oldPosition || state.player.position
                state.player.position = newPosition
                if (newPosition.x > prevPos.x) state.player.direction = 'right'
                else if (newPosition.x < prevPos.x) state.player.direction = 'left'
                else if (newPosition.y > prevPos.y) state.player.direction = 'down'
                else if (newPosition.y < prevPos.y) state.player.direction = 'up'
                get().actions._updateAnimationState()
            }),
            addScore: (amount) => set((state) => {
                state.player.score += amount
            }),
            startAction: (actionType, targetId, duration) => {
                const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                set((state) => {
                    const newAction: PlayerAction = {
                        id: actionId,
                        type: actionType,
                        target: targetId,
                        startTime: Date.now(),
                        duration,
                        status: 'in_progress',
                        completionTime: null
                    }
                    state.player.currentAction = newAction
                })
                get().actions._updateAnimationState()
                return actionId
            },
            queueAction: (actionType, targetId, duration) => {
                const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                set((state) => {
                    const newAction: PlayerAction = {
                        id: actionId,
                        type: actionType,
                        target: targetId,
                        startTime: 0,
                        duration,
                        status: 'queued',
                        completionTime: null
                    }
                    state.player.actionQueue.push(newAction)
                })
                return actionId
            },
            completeAction: (actionId, success) => set((state) => {
                if (state.player.currentAction && state.player.currentAction.id === actionId) {
                    state.player.currentAction.status = success ? 'completed' : 'failed'
                    state.player.currentAction.completionTime = Date.now()
                    state.player.actionHistory.unshift(state.player.currentAction)
                    if (state.player.actionHistory.length > 20) {
                        state.player.actionHistory.pop()
                    }
                    state.player.currentAction = null
                    if (state.player.actionQueue.length > 0) {
                        const nextAction = state.player.actionQueue.shift()!
                        nextAction.status = 'in_progress'
                        nextAction.startTime = Date.now()
                        state.player.currentAction = nextAction
                    }
                } else {
                    const actionIndex = state.player.actionQueue.findIndex((action) => action.id === actionId)
                    if (actionIndex !== -1) {
                        const action = state.player.actionQueue[actionIndex]
                        action.status = success ? 'completed' : 'failed'
                        action.completionTime = Date.now()
                        state.player.actionHistory.unshift(action)
                        if (state.player.actionHistory.length > 20) {
                            state.player.actionHistory.pop()
                        }
                        state.player.actionQueue.splice(actionIndex, 1)
                    }
                }
                get().actions._updateAnimationState()
            }),
            cancelAction: (actionId) => set((state) => {
                if (state.player.currentAction && state.player.currentAction.id === actionId) {
                    state.player.currentAction = null
                    if (state.player.actionQueue.length > 0) {
                        const nextAction = state.player.actionQueue.shift()!
                        nextAction.status = 'in_progress'
                        nextAction.startTime = Date.now()
                        state.player.currentAction = nextAction
                    }
                } else {
                    state.player.actionQueue = state.player.actionQueue.filter(
                        (action) => action.id !== actionId
                    )
                }
                get().actions._updateAnimationState()
            }),
            clearActionQueue: () => set((state) => {
                state.player.actionQueue = []
            }),
            moveToArea: (area, x, y) => set((state) => {
                const oldPos = state.player.position
                state.player.position = { area, x, y }
                if (x > oldPos.x) state.player.direction = 'right'
                else if (x < oldPos.x) state.player.direction = 'left'
                else if (y > oldPos.y) state.player.direction = 'down'
                else if (y < oldPos.y) state.player.direction = 'up'
                if (!state.player.currentAction) {
                    state.player.animationState = get().isCarryingItem ? `running_lifting_${state.player.direction}` as ChefAnimationType : `running_${state.player.direction}` as ChefAnimationType
                }
                get().actions._updateAnimationState()
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
                    position: defaultPlayerPosition,
                    currentAction: null,
                    actionQueue: [],
                    actionHistory: [],
                    direction: 'down',
                    animationState: 'idle',
                }
                state.isCarryingItem = false
                get().actions._updateAnimationState()
            }),
            setPlayerDirection: (direction) => set((state) => {
                state.player.direction = direction
                get().actions._updateAnimationState()
            }),
            setCarryingItem: (isCarrying) => set((state) => {
                state.isCarryingItem = isCarrying
                get().actions._updateAnimationState()
            }),
            _updateAnimationState: () => set((state) => {
                const { currentAction, direction } = state.player
                const { isCarryingItem } = get()

                // Ensure animationState is defined
                if (typeof state.player.animationState === 'undefined') {
                    state.player.animationState = 'idle';
                }

                if (currentAction) {
                    switch (currentAction.type) {
                        case 'move':
                            state.player.animationState = isCarryingItem ? `running_lifting_${direction}` as ChefAnimationType : `running_${direction}` as ChefAnimationType
                            break
                        case 'prepare_ingredient':
                        case 'cook':
                        case 'plate':
                            state.player.animationState = `interacting_${direction}` as ChefAnimationType
                            break
                        default:
                            if (!state.player.animationState.startsWith('running')) {
                                state.player.animationState = 'idle'
                            }
                            break
                    }
                } else {
                    // Ensure animationState is defined here too before startsWith check
                    if (typeof state.player.animationState === 'undefined') {
                        state.player.animationState = 'idle';
                    }
                    if (!state.player.animationState.startsWith('running')) {
                        state.player.animationState = isCarryingItem ? 'idle' : 'idle' // Consider if this should be running_lifting_idle or similar
                    }
                }
            }),
            setDirection: (direction) => set((state) => {
                state.player.direction = direction
                get().actions._updateAnimationState()
            }),
            setAnimationState: (animationState) => set((state) => {
                state.player.animationState = animationState
                get().actions._updateAnimationState()
            }),
            loadSpriteConfig: (config) => set((state) => {
                state.player.spriteConfig = config
                get().actions._updateAnimationState()
            }),
        }
    }))
) 
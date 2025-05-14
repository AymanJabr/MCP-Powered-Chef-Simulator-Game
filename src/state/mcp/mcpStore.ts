import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
    MCPAssistant,
    MCPCommand,
    MCPAction,
    MCPActionType,
    LLMProvider,
    SavedCommand
} from '@/types/models'

interface MCPState {
    assistant: MCPAssistant
    suggestedCommands: SavedCommand[]
    actions: {
        toggleActive: () => void
        setProvider: (provider: LLMProvider) => void
        sendCommand: (command: string) => Promise<void>
        cancelCommand: () => void
        recordActionResult: (
            commandId: string,
            actionId: string,
            status: MCPAction['status'],
            result?: any
        ) => void
        saveCommand: (command: Omit<SavedCommand, 'id'>) => string
        executeAction: (
            commandId: string,
            type: MCPActionType,
            target: string,
            params: Record<string, any>
        ) => Promise<string>
        completeCommand: (commandId: string, success: boolean) => void
        resetMetrics: () => void
    }
}

const DEFAULT_PROVIDER: LLMProvider = {
    name: 'mock',
    model: 'mock-1.0',
    temperature: 0.7,
    maxTokens: 1000
}

// Mock LLM response implementation for testing
// Exported to allow for mocking in tests
export const mockLLMResponse = async (input: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return `I'll help you with "${input}"`
}

export const useMCPStore = create<MCPState>()(
    immer((set) => ({
        assistant: {
            isActive: false,
            currentCommand: null,
            commandHistory: [],
            performanceMetrics: {
                successRate: 0,
                averageResponseTime: 0,
                customerSatisfactionDelta: 0,
                ordersPerMinute: 0,
                commandsExecuted: 0,
                failedCommands: 0
            },
            provider: DEFAULT_PROVIDER,
            status: 'idle'
        },
        suggestedCommands: [
            {
                id: 'default_1',
                name: 'Take All Orders',
                command: 'Take orders from all waiting customers',
                tags: ['orders', 'customers']
            },
            {
                id: 'default_2',
                name: 'Cook All',
                command: 'Cook all prepared ingredients',
                tags: ['cooking', 'efficiency']
            },
            {
                id: 'default_3',
                name: 'Serve All Ready',
                command: 'Serve all completed dishes to customers',
                tags: ['service', 'efficiency']
            },
            {
                id: 'default_4',
                name: 'Restock Low Ingredients',
                command: 'Purchase more of any ingredients that are running low',
                tags: ['inventory', 'preparation']
            }
        ],
        actions: {
            toggleActive: () => set((state) => {
                state.assistant.isActive = !state.assistant.isActive
            }),

            setProvider: (provider) => set((state) => {
                state.assistant.provider = provider
            }),

            sendCommand: async (command) => {
                // First update the state to show we're processing
                set((state) => {
                    state.assistant.currentCommand = command
                    state.assistant.status = 'processing'
                })

                // Create a new command entry
                const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
                const newCommand: MCPCommand = {
                    id: commandId,
                    input: command,
                    response: null,
                    actions: [],
                    startTime: Date.now(),
                    completionTime: null,
                    success: null
                }

                set((state) => {
                    // Add to history
                    state.assistant.commandHistory.unshift(newCommand)

                    // Limit history size
                    if (state.assistant.commandHistory.length > 50) {
                        state.assistant.commandHistory.pop()
                    }
                })

                try {
                    // Get LLM response
                    const response = await mockLLMResponse(command)

                    // Update state with response
                    set((state) => {
                        const cmdIndex = state.assistant.commandHistory.findIndex(
                            cmd => cmd.id === commandId
                        )

                        if (cmdIndex !== -1) {
                            state.assistant.commandHistory[cmdIndex].response = response
                        }

                        // Change status to executing - waiting for actions
                        state.assistant.status = 'executing'
                    })

                    return Promise.resolve()
                } catch (error) {
                    // Handle errors
                    set((state) => {
                        const cmdIndex = state.assistant.commandHistory.findIndex(
                            cmd => cmd.id === commandId
                        )

                        if (cmdIndex !== -1) {
                            state.assistant.commandHistory[cmdIndex].response =
                                `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                            state.assistant.commandHistory[cmdIndex].success = false
                            state.assistant.commandHistory[cmdIndex].completionTime = Date.now()
                        }

                        // Reset status
                        state.assistant.status = 'idle'
                        state.assistant.currentCommand = null

                        // Update metrics
                        state.assistant.performanceMetrics.failedCommands += 1
                        state.assistant.performanceMetrics.commandsExecuted += 1
                        state.assistant.performanceMetrics.successRate =
                            (state.assistant.performanceMetrics.commandsExecuted -
                                state.assistant.performanceMetrics.failedCommands) /
                            state.assistant.performanceMetrics.commandsExecuted
                    })

                    return Promise.reject(error)
                }
            },

            cancelCommand: () => set((state) => {
                // Find the current command in history
                if (state.assistant.currentCommand) {
                    const cmdIndex = state.assistant.commandHistory.findIndex(
                        cmd => cmd.completionTime === null
                    )

                    if (cmdIndex !== -1) {
                        state.assistant.commandHistory[cmdIndex].success = false
                        state.assistant.commandHistory[cmdIndex].completionTime = Date.now()
                    }
                }

                // Reset status
                state.assistant.status = 'idle'
                state.assistant.currentCommand = null
            }),

            recordActionResult: (commandId, actionId, status, result) => set((state) => {
                // Find command
                const cmdIndex = state.assistant.commandHistory.findIndex(
                    cmd => cmd.id === commandId
                )

                if (cmdIndex === -1) return

                // Find action
                const actionIndex = state.assistant.commandHistory[cmdIndex].actions.findIndex(
                    action => action.id === actionId
                )

                if (actionIndex === -1) return

                // Update action
                const action = state.assistant.commandHistory[cmdIndex].actions[actionIndex]
                action.status = status
                if (result !== undefined) {
                    action.result = result
                }
            }),

            saveCommand: (command) => {
                const commandId = `saved_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

                set((state) => {
                    // Add to suggested commands
                    state.suggestedCommands.push({
                        id: commandId,
                        ...command
                    })
                })

                return commandId
            },

            executeAction: async (commandId, type, target, params) => {
                const actionId = `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

                // Create the action
                const newAction: MCPAction = {
                    id: actionId,
                    type,
                    target,
                    params,
                    status: 'pending',
                    timestamp: Date.now()
                }

                // Add to command
                set((state) => {
                    const cmdIndex = state.assistant.commandHistory.findIndex(
                        cmd => cmd.id === commandId
                    )

                    if (cmdIndex !== -1) {
                        state.assistant.commandHistory[cmdIndex].actions.push(newAction)
                    }
                })

                return actionId
            },

            completeCommand: (commandId, success) => set((state) => {
                // Find command
                const cmdIndex = state.assistant.commandHistory.findIndex(
                    cmd => cmd.id === commandId
                )

                if (cmdIndex === -1) return

                // Update command
                state.assistant.commandHistory[cmdIndex].success = success
                state.assistant.commandHistory[cmdIndex].completionTime = Date.now()

                // Reset status
                state.assistant.status = 'idle'
                state.assistant.currentCommand = null

                // Update metrics
                state.assistant.performanceMetrics.commandsExecuted += 1

                if (!success) {
                    state.assistant.performanceMetrics.failedCommands += 1
                }

                state.assistant.performanceMetrics.successRate =
                    (state.assistant.performanceMetrics.commandsExecuted -
                        state.assistant.performanceMetrics.failedCommands) /
                    state.assistant.performanceMetrics.commandsExecuted

                // Calculate response time
                const startTime = state.assistant.commandHistory[cmdIndex].startTime
                const completionTime = state.assistant.commandHistory[cmdIndex].completionTime!
                const responseTime = (completionTime - startTime) / 1000 // in seconds

                // Update average response time using weighted average
                const { averageResponseTime, commandsExecuted } = state.assistant.performanceMetrics

                if (commandsExecuted <= 1) {
                    state.assistant.performanceMetrics.averageResponseTime = responseTime
                } else {
                    state.assistant.performanceMetrics.averageResponseTime =
                        (averageResponseTime * (commandsExecuted - 1) + responseTime) /
                        commandsExecuted
                }
            }),

            resetMetrics: () => set((state) => {
                state.assistant.performanceMetrics = {
                    successRate: 0,
                    averageResponseTime: 0,
                    customerSatisfactionDelta: 0,
                    ordersPerMinute: 0,
                    commandsExecuted: 0,
                    failedCommands: 0
                }
            })
        }
    }))
) 
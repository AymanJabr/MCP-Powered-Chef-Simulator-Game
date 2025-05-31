import { useMCPStore, setLLMService, LLMService } from '../mcpStore'
import { LLMProvider, MCPActionType } from '@/types/models'

// Mock Date.now to return a consistent value for testing
const originalDateNow = Date.now
const mockNow = 1619784000000 // May 1, 2021

// Create a mock LLM service for testing
class MockLLMService implements LLMService {
    async generateResponse(input: string): Promise<string> {
        return `I'll help you with "${input}"`
    }
}

// Setup our mock service
const mockLLMService = new MockLLMService();

describe('MCP Store', () => {
    beforeAll(() => {
        // Mock Date.now
        Date.now = jest.fn(() => mockNow)

        // Set our mock LLM service
        setLLMService(mockLLMService);
    })

    afterAll(() => {
        // Restore original Date.now
        Date.now = originalDateNow
    })

    beforeEach(() => {
        // Reset store to a clean state
        useMCPStore.setState({
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
                provider: {
                    name: 'mock',
                    model: 'mock-1.0',
                    temperature: 0.7,
                    maxTokens: 1000
                },
                status: 'idle'
            },
            suggestedCommands: [
                {
                    id: 'default_1',
                    name: 'Take All Orders',
                    command: 'Take orders from all waiting customers',
                    tags: ['orders', 'customers']
                }
            ]
        })
    })

    it('should initialize with default values', () => {
        const { assistant, suggestedCommands } = useMCPStore.getState()

        expect(assistant.isActive).toBe(false)
        expect(assistant.currentCommand).toBeNull()
        expect(assistant.commandHistory).toEqual([])
        expect(assistant.status).toBe('idle')
        expect(assistant.performanceMetrics.commandsExecuted).toBe(0)

        // Should have default suggested commands
        expect(suggestedCommands.length).toBeGreaterThan(0)
        expect(suggestedCommands[0].name).toBe('Take All Orders')
    })

    it('should toggle assistant active state', () => {
        const { actions } = useMCPStore.getState()

        // Initially false
        expect(useMCPStore.getState().assistant.isActive).toBe(false)

        // Toggle to true
        actions.toggleActive()
        expect(useMCPStore.getState().assistant.isActive).toBe(true)

        // Toggle to false
        actions.toggleActive()
        expect(useMCPStore.getState().assistant.isActive).toBe(false)
    })

    it('should set LLM provider', () => {
        const { actions } = useMCPStore.getState()

        // Define a new provider
        const newProvider: LLMProvider = {
            name: 'claude',
            model: 'claude-3-opus',
            temperature: 0.5,
            maxTokens: 2000
        }

        // Set the provider
        actions.setProvider(newProvider)

        // Check that provider was updated
        expect(useMCPStore.getState().assistant.provider).toEqual(newProvider)
    })

    it('should send a command and receive a response', async () => {
        const { actions } = useMCPStore.getState()

        // Spy on the mock service
        const generateResponseSpy = jest.spyOn(mockLLMService, 'generateResponse')

        // Send a test command
        const commandPromise = actions.sendCommand('Test command')

        // Verify processing state
        let state = useMCPStore.getState()
        expect(state.assistant.currentCommand).toBe('Test command')
        expect(state.assistant.status).toBe('processing')
        expect(state.assistant.commandHistory.length).toBe(1)
        expect(state.assistant.commandHistory[0].input).toBe('Test command')
        expect(state.assistant.commandHistory[0].startTime).toBe(mockNow)

        // Wait for the command to complete
        await commandPromise

        // Verify the service was called
        expect(generateResponseSpy).toHaveBeenCalledWith('Test command')

        // Verify updated state
        state = useMCPStore.getState()
        expect(state.assistant.status).toBe('executing')
        expect(state.assistant.commandHistory[0].response).toBe('I\'ll help you with "Test command"')
        expect(state.assistant.commandHistory[0].completionTime).toBeNull() // Not completed yet
    })

    it('should cancel an in-progress command', async () => {
        const { actions } = useMCPStore.getState()

        // Start a command
        const commandPromise = actions.sendCommand('Test command')

        // Wait for the command processing to complete
        await commandPromise

        // Cancel the command
        actions.cancelCommand()

        // Verify state after cancellation
        const state = useMCPStore.getState()
        expect(state.assistant.status).toBe('idle')
        expect(state.assistant.currentCommand).toBeNull()
        expect(state.assistant.commandHistory[0].success).toBe(false)
        expect(state.assistant.commandHistory[0].completionTime).toBe(mockNow)
    })

    it('should execute an action for a command', async () => {
        const { actions } = useMCPStore.getState()

        // Send a command first
        await actions.sendCommand('Serve a dish')

        // Get the command ID
        const commandId = useMCPStore.getState().assistant.commandHistory[0].id

        // Execute an action
        const actionType: MCPActionType = 'serve_order'
        const target = 'order_123'
        const params = { customerId: 'customer_456' }

        const actionId = await actions.executeAction(commandId, actionType, target, params)

        // Verify the action was added
        const state = useMCPStore.getState()
        const command = state.assistant.commandHistory[0]

        expect(command.actions.length).toBe(1)
        expect(command.actions[0].id).toBe(actionId)
        expect(command.actions[0].type).toBe(actionType)
        expect(command.actions[0].target).toBe(target)
        expect(command.actions[0].params).toEqual(params)
        expect(command.actions[0].status).toBe('pending')
    })

    it('should record action results', async () => {
        const { actions } = useMCPStore.getState()

        // Setup a command with an action
        await actions.sendCommand('Cook a dish')

        const commandId = useMCPStore.getState().assistant.commandHistory[0].id
        const actionId = await actions.executeAction(
            commandId,
            'cook_ingredient',
            'ingredient_123',
            { type: 'fry', duration: 60 }
        )

        // Record a successful result
        const result = { qualityScore: 85 }
        actions.recordActionResult(commandId, actionId, 'successful', result)

        // Verify the result was recorded
        const state = useMCPStore.getState()
        const action = state.assistant.commandHistory[0].actions[0]

        expect(action.status).toBe('successful')
        expect(action.result).toEqual(result)
    })

    it('should complete a command and update metrics', async () => {
        const { actions } = useMCPStore.getState()

        // Setup a command
        await actions.sendCommand('Take customer order')

        const commandId = useMCPStore.getState().assistant.commandHistory[0].id

        // Add some actions
        await actions.executeAction(
            commandId,
            'greet_customer',
            'customer_123',
            {}
        )

        await actions.executeAction(
            commandId,
            'take_order',
            'customer_123',
            {}
        )

        // Complete the command successfully
        actions.completeCommand(commandId, true)

        // Verify state
        const state = useMCPStore.getState()
        expect(state.assistant.status).toBe('idle')
        expect(state.assistant.currentCommand).toBeNull()

        // Verify command
        const command = state.assistant.commandHistory[0]
        expect(command.success).toBe(true)
        expect(command.completionTime).toBe(mockNow)

        // Verify metrics
        const metrics = state.assistant.performanceMetrics
        expect(metrics.commandsExecuted).toBe(1)
        expect(metrics.failedCommands).toBe(0)
        expect(metrics.successRate).toBe(1) // 100% success rate
        expect(metrics.averageResponseTime).toBe(0) // Same time for mock
    })

    it('should fail a command and update metrics', async () => {
        const { actions } = useMCPStore.getState()

        // Setup a command
        await actions.sendCommand('Invalid command')

        const commandId = useMCPStore.getState().assistant.commandHistory[0].id

        // Complete the command with failure
        actions.completeCommand(commandId, false)

        // Verify metrics
        const metrics = useMCPStore.getState().assistant.performanceMetrics
        expect(metrics.commandsExecuted).toBe(1)
        expect(metrics.failedCommands).toBe(1)
        expect(metrics.successRate).toBe(0) // 0% success rate
    })

    it('should save a custom command', () => {
        const { actions } = useMCPStore.getState()

        const customCommand = {
            name: 'Custom Command',
            command: 'Do a specific sequence of actions',
            tags: ['custom', 'specific']
        }

        const commandId = actions.saveCommand(customCommand)

        // Verify command was saved
        const { suggestedCommands } = useMCPStore.getState()
        const savedCommand = suggestedCommands.find(cmd => cmd.id === commandId)

        expect(savedCommand).toBeDefined()
        expect(savedCommand?.name).toBe('Custom Command')
        expect(savedCommand?.command).toBe('Do a specific sequence of actions')
        expect(savedCommand?.tags).toEqual(['custom', 'specific'])
    })

    it('should reset performance metrics', async () => {
        const { actions } = useMCPStore.getState()

        // Execute some commands to create metrics
        await actions.sendCommand('Command 1')
        const cmd1Id = useMCPStore.getState().assistant.commandHistory[0].id
        actions.completeCommand(cmd1Id, true)

        await actions.sendCommand('Command 2')
        const cmd2Id = useMCPStore.getState().assistant.commandHistory[0].id
        actions.completeCommand(cmd2Id, false)

        // Verify metrics were updated
        let metrics = useMCPStore.getState().assistant.performanceMetrics
        expect(metrics.commandsExecuted).toBe(2)
        expect(metrics.failedCommands).toBe(1)

        // Reset metrics
        actions.resetMetrics()

        // Verify metrics were reset
        metrics = useMCPStore.getState().assistant.performanceMetrics
        expect(metrics.commandsExecuted).toBe(0)
        expect(metrics.failedCommands).toBe(0)
        expect(metrics.successRate).toBe(0)
        expect(metrics.averageResponseTime).toBe(0)
    })

    it('should limit command history to 50 items', async () => {
        const { actions } = useMCPStore.getState()

        // Add 55 commands (more than the limit of 50)
        for (let i = 0; i < 55; i++) {
            await actions.sendCommand(`Command ${i}`)
            const cmdId = useMCPStore.getState().assistant.commandHistory[0].id
            actions.completeCommand(cmdId, true)
        }

        // Verify history length is capped at 50
        const { commandHistory } = useMCPStore.getState().assistant
        expect(commandHistory.length).toBe(50)

        // Newest commands should be at the beginning
        expect(commandHistory[0].input).toBe('Command 54')
        expect(commandHistory[49].input).toBe('Command 5')
    })
}) 
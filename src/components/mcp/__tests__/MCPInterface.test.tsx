import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MCPInterface from '../MCPInterface'
import { useMCPStore } from '@/state/mcp/mcpStore'
import { useCommandsStore } from '@/mcp/client/commands'
import { MantineProvider } from '@mantine/core'

// Mock hooks
jest.mock('@/state/mcp/mcpStore')
jest.mock('@/mcp/client/commands')

// Mock SavedCommands sub-component to avoid Mantine complexity
jest.mock('../SavedCommands', () => (props: any) => (
    <div data-testid="saved-commands">
        {props.commands.map((cmd: any) => (
            <button key={cmd.id} data-testid={`cmd-${cmd.id}`} onClick={() => props.onSelect(cmd)}>
                {cmd.name}
            </button>
        ))}
    </div>
))

describe('MCPInterface', () => {
    const sendCommand = jest.fn().mockResolvedValue(undefined)
    const saveCommand = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

            // Mock MCP store
            ; (useMCPStore as unknown as jest.Mock).mockReturnValue({
                assistant: {
                    currentCommand: null,
                    commandHistory: [
                        { id: '1', input: 'Hello', response: 'Hi there' }
                    ],
                    status: 'idle',
                },
                actions: { sendCommand },
            })

            // Mock Commands store
            ; (useCommandsStore as unknown as jest.Mock).mockReturnValue({
                savedCommands: [
                    { id: 'saved1', name: 'Saved', command: 'saved text', tags: [] },
                ],
                suggestedCommands: [],
                actions: { saveCommand, deleteCommand: jest.fn() },
            })
    })

    it('renders command history', () => {
        render(<MantineProvider><MCPInterface /></MantineProvider>)
        expect(screen.getByText('Hello')).toBeInTheDocument()
        expect(screen.getByText('Hi there')).toBeInTheDocument()
    })

    it('sends command on button click', async () => {
        render(<MantineProvider><MCPInterface /></MantineProvider>)

        const textarea = screen.getByPlaceholderText('Enter command for MCP...') as HTMLTextAreaElement
        fireEvent.change(textarea, { target: { value: 'test cmd' } })

        const sendBtn = screen.getByRole('button', { name: /send/i })
        fireEvent.click(sendBtn)

        await waitFor(() => expect(sendCommand).toHaveBeenCalledWith('test cmd'))
    })

    it('saves command', () => {
        render(<MantineProvider><MCPInterface /></MantineProvider>)

        const textarea = screen.getByPlaceholderText('Enter command for MCP...') as HTMLTextAreaElement
        fireEvent.change(textarea, { target: { value: 'store me' } })

        const buttons = screen.getAllByRole('button')
        const pinBtn = buttons[buttons.length - 1]
        fireEvent.click(pinBtn)

        expect(saveCommand).toHaveBeenCalled()
    })

    it('selects saved command to input', () => {
        render(<MantineProvider><MCPInterface /></MantineProvider>)

        const savedButton = screen.getByTestId('cmd-saved1')
        fireEvent.click(savedButton)

        const textarea = screen.getByPlaceholderText('Enter command for MCP...') as HTMLTextAreaElement
        expect(textarea).toHaveValue('saved text')
    })
}) 
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SavedCommands from '../SavedCommands'
import { MantineProvider } from '@mantine/core'
import { SavedCommand } from '@/types/models'

describe('SavedCommands component', () => {
    const sampleCommands: SavedCommand[] = [
        { id: '1', name: 'Cmd1', command: 'do something', tags: ['test'] },
        { id: '2', name: 'Cmd2', command: 'do other', tags: [] },
    ]

    it('renders nothing when no commands', () => {
        render(
            <MantineProvider>
                <SavedCommands commands={[]} onSelect={jest.fn()} />
            </MantineProvider>
        )
        // No command buttons should be rendered
        expect(screen.queryByRole('button')).toBeNull()
    })

    it('renders list of commands', () => {
        render(
            <MantineProvider>
                <SavedCommands commands={sampleCommands} onSelect={jest.fn()} />
            </MantineProvider>
        )
        expect(screen.getByText('Cmd1')).toBeInTheDocument()
        expect(screen.getByText('Cmd2')).toBeInTheDocument()
    })

    it('calls onSelect when command clicked', () => {
        const onSelect = jest.fn()
        render(
            <MantineProvider>
                <SavedCommands commands={sampleCommands} onSelect={onSelect} />
            </MantineProvider>
        )
        fireEvent.click(screen.getByText('Cmd1'))
        expect(onSelect).toHaveBeenCalledWith(sampleCommands[0])
    })

    it('calls onDelete when trash icon clicked', () => {
        const onDelete = jest.fn()
        render(
            <MantineProvider>
                <SavedCommands
                    commands={sampleCommands}
                    onSelect={jest.fn()}
                    onDelete={onDelete}
                />
            </MantineProvider>
        )
        const trashButtons = screen.getAllByRole('button')
        // second button in each row is trash; click first trash icon
        fireEvent.click(trashButtons[1])
        expect(onDelete).toHaveBeenCalledWith('1')
    })
}) 
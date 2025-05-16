'use client'

import { useState } from 'react'
import { Textarea, Button, ActionIcon, Paper, Title, Card, Text, Stack, Group } from '@mantine/core'
import { IconSend, IconPin } from '@tabler/icons-react'
import { useMCPStore } from '@/state/mcp/mcpStore'
import { useCommandsStore } from '@/mcp/client/commands'
import SavedCommands from './SavedCommands'

export default function MCPInterface() {
    const [input, setInput] = useState('')

    const {
        assistant: { currentCommand, commandHistory, status },
        actions: mcpActions,
    } = useMCPStore()

    const {
        savedCommands,
        suggestedCommands,
        actions: commandActions,
    } = useCommandsStore()

    const handleSend = async () => {
        const trimmed = input.trim()
        if (!trimmed) return
        await mcpActions.sendCommand(trimmed)
        setInput('')
    }

    const handleSave = () => {
        const trimmed = input.trim()
        if (!trimmed) return
        commandActions.saveCommand({ name: `Custom ${savedCommands.length + 1}`, command: trimmed, tags: [] })
    }

    const allCommands = [...suggestedCommands, ...savedCommands]

    return (
        <Paper p="md" radius="md" shadow="sm">
            <Title order={5} mb="sm">
                MCP Assistant
            </Title>
            {/* Command history */}
            <Stack mb="md" gap="xs" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {commandHistory.map((cmd) => (
                    <Card key={cmd.id} padding="xs" shadow="xs">
                        <Text size="sm" c="dimmed">
                            You:
                        </Text>
                        <Text>{cmd.input}</Text>
                        {cmd.response && (
                            <>
                                <Text size="sm" c="dimmed" mt="xs">
                                    MCP:
                                </Text>
                                <Text>{cmd.response}</Text>
                            </>
                        )}
                    </Card>
                ))}
            </Stack>

            {currentCommand && (
                <Card mb="md" padding="xs" shadow="xs">
                    <Text size="sm" c="dimmed">
                        Processing:
                    </Text>
                    <Text>{currentCommand}</Text>
                </Card>
            )}

            <SavedCommands
                commands={allCommands}
                onSelect={(cmd) => setInput(cmd.command)}
                onDelete={(id) => commandActions.deleteCommand(id)}
            />

            {/* Input area */}
            <Stack gap="xs">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                    placeholder="Enter command for MCP..."
                    minRows={2}
                    maxRows={4}
                    disabled={status === 'processing'}
                />
                <Group justify="space-between">
                    <Button leftSection={<IconSend size={16} />} onClick={handleSend} disabled={status === 'processing'}>
                        Send
                    </Button>
                    <ActionIcon variant="subtle" color="blue" onClick={handleSave} disabled={!input.trim()}>
                        <IconPin size={18} />
                    </ActionIcon>
                </Group>
            </Stack>
        </Paper>
    )
} 
'use client'

import { ActionIcon, Badge, Button, Card, Group, ScrollArea, Stack, Text } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { SavedCommand } from '@/types/models'

interface Props {
    commands: SavedCommand[]
    onSelect: (cmd: SavedCommand) => void
    onDelete?: (id: string) => void
}

export default function SavedCommands({ commands, onSelect, onDelete }: Props) {
    if (!commands.length) return null

    const handleDelete = (id: string) => {
        if (onDelete) onDelete(id)
    }

    return (
        <Card withBorder shadow="xs" padding="xs" mb="sm">
            <Text size="sm" fw={500} mb="xs">
                Quick Commands
            </Text>
            <ScrollArea h={140} type="always">
                <Stack gap="xs">
                    {commands.map((cmd) => (
                        <Group key={cmd.id} justify="space-between" wrap="nowrap">
                            <Button
                                variant="light"
                                size="xs"
                                fullWidth
                                onClick={() => onSelect(cmd)}
                                leftSection={<Badge color="gray" variant="light" size="sm">{cmd.tags[0] ?? 'cmd'}</Badge>}
                            >
                                {cmd.name}
                            </Button>
                            {onDelete && (
                                <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(cmd.id)}>
                                    <IconTrash size={14} />
                                </ActionIcon>
                            )}
                        </Group>
                    ))}
                </Stack>
            </ScrollArea>
        </Card>
    )
} 
'use client'

import { Badge, Card, Progress, ScrollArea, Table, Text, Title } from '@mantine/core'
import { useKitchenStore } from '@/state/game/kitchenStore'

export default function KitchenArea() {
    const { cookingStations, activeCookingProcesses } = useKitchenStore()

    const rows = cookingStations.map((station) => {
        const process = activeCookingProcesses.find((p) => p.stationId === station.id && p.status === 'in_progress')
        const progressPct = process ? Math.min(process.progress, 100) : 0
        const statusColor = station.status === 'busy' ? 'yellow' : station.status === 'broken' ? 'red' : 'green'
        return (
            <tr key={station.id}>
                <td>{station.id}</td>
                <td>{station.type}</td>
                <td>
                    <Badge color={statusColor}>{station.status}</Badge>
                </td>
                <td>{station.temperature}°C</td>
                <td style={{ width: 200 }}>
                    {process ? (
                        <Progress value={progressPct} radius="sm" size="sm" />
                    ) : (
                        <Text size="xs" c="dimmed">
                            Idle
                        </Text>
                    )}
                </td>
            </tr>
        )
    })

    return (
        <div>
            <Title order={5} mb="sm">
                Kitchen
            </Title>
            <ScrollArea h={260}>
                <Card p={0} shadow="xs">
                    <Table withColumnBorders horizontalSpacing="sm" verticalSpacing="xs">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Temp</th>
                                <th>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length ? rows : (
                                <tr>
                                    <td colSpan={5}>
                                        <Text ta="center">No stations</Text>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            </ScrollArea>
        </div>
    )
} 
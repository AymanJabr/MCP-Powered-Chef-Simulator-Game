'use client'

import { Card, Grid, Text, Title } from '@mantine/core'
import type { Game } from '@/types/models'

type Performance = Game['performanceMetrics']

interface Props {
    metrics: Performance
}

export default function PerformanceMetrics({ metrics }: Props) {
    const entries = [
        { label: 'Customer Sat.', value: metrics.customerSatisfaction.toFixed(0) },
        { label: 'Order Speed', value: metrics.orderCompletionTime.toFixed(0) },
        { label: 'Finance', value: metrics.financialPerformance.toFixed(0) },
        { label: 'Efficiency', value: metrics.efficiency.toFixed(0) },
    ]

    return (
        <div>
            <Title order={5} mb="sm">
                Performance
            </Title>
            <Grid>
                {entries.map((e) => (
                    <Grid.Col span={6} key={e.label}>
                        <Card p="xs" shadow="xs">
                            <Text size="xs" c="dimmed">
                                {e.label}
                            </Text>
                            <Text fw={500}>{e.value}</Text>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </div>
    )
} 
'use client'

import { Grid, Paper } from '@mantine/core'
import { useGameStore } from '@/state/game/gameStore'
import CustomerArea from './CustomerArea'
import PerformanceMetrics from './PerformanceMetrics'
import KitchenArea from './KitchenArea'
import ManualControls from './ManualControls'
import MCPInterface from '../mcp/MCPInterface'
import Inventory from './Inventory'

export default function RestaurantView() {
    const { game } = useGameStore()

    return (
        <Grid grow>
            {/* Customer & Dining section */}
            <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper p="md" shadow="sm">
                    <CustomerArea />
                </Paper>
            </Grid.Col>

            {/* Sidebar – inventory + metrics */}
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper p="md" shadow="sm" mb="md">
                    {game.gameMode === 'mcp' ? <MCPInterface /> : <ManualControls />}
                    <Inventory />
                </Paper>
                <Paper p="md" shadow="sm">
                    <PerformanceMetrics metrics={game.performanceMetrics} />
                </Paper>
            </Grid.Col>

            {/* Kitchen section across full width */}
            <Grid.Col span={12}>
                <Paper p="md" shadow="sm">
                    <KitchenArea />
                </Paper>
            </Grid.Col>
        </Grid>
    )
} 
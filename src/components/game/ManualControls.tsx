'use client'

import { Paper, Title, Button, Group, Stack } from '@mantine/core'
import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { generateCustomer } from '@/lib/customerGeneration'
import { serveOrder } from '@/lib/orderFulfillment'
import { purchaseIngredient } from '@/lib/inventoryManagement'

export default function ManualControls() {
    const { game, actions: gameActions } = useGameStore()
    const { restaurant } = useRestaurantStore()

    /** Toggle pause/resume */
    const handleTogglePause = () => {
        gameActions.togglePause()
    }

    /** Spawn a new customer (debug helper / manual action) */
    const handleSpawnCustomer = () => {
        generateCustomer()
    }

    /** Serve all plated orders */
    const handleServeAll = () => {
        restaurant.activeOrders
            .filter((o) => o.status === 'plated')
            .forEach((o) => {
                serveOrder(o.id)
            })
    }

    /** Purchase low-stock ingredients */
    const handleRestockLow = () => {
        restaurant.inventory
            .filter((ing) => ing.quantity < 5)
            .forEach((ing) => {
                purchaseIngredient(ing.id, 5)
            })
    }

    return (
        <Paper p="md" radius="md" shadow="sm">
            <Title order={5} mb="sm">
                Manual Controls
            </Title>
            <Stack gap="sm">
                <Group>
                    <Button color={game.isPaused ? 'green' : 'yellow'} onClick={handleTogglePause}>
                        {game.isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button onClick={handleSpawnCustomer}>Spawn Customer</Button>
                </Group>
                <Group>
                    <Button onClick={handleServeAll}>Serve Plated Orders</Button>
                    <Button onClick={handleRestockLow}>Restock Low Ingredients</Button>
                </Group>
            </Stack>
        </Paper>
    )
} 
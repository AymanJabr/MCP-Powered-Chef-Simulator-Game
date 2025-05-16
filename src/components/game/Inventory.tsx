'use client'

import { Badge, Button, Card, NumberInput, ScrollArea, Stack, Table, Text, Title } from '@mantine/core'
import { useState } from 'react'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { purchaseIngredient } from '@/lib/inventoryManagement'

export default function Inventory() {
    const { restaurant } = useRestaurantStore()
    const LOW_THRESHOLD = 5

    const [purchaseQty, setPurchaseQty] = useState<Record<string, number>>({})

    const handlePurchase = (ingredientId: string) => {
        const qty = purchaseQty[ingredientId] ?? 1
        purchaseIngredient(ingredientId, qty)
    }

    const rows = restaurant.inventory.map((ing) => {
        const isLow = ing.quantity < LOW_THRESHOLD
        return (
            <tr key={ing.id}>
                <td>{ing.name}</td>
                <td>{ing.quantity}</td>
                <td>
                    {isLow && (
                        <Badge color="red" mr="xs">
                            Low
                        </Badge>
                    )}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                    <Stack gap="xs" align="flex-start">
                        <NumberInput
                            size="xs"
                            value={purchaseQty[ing.id] ?? 1}
                            min={1}
                            onChange={(v) =>
                                setPurchaseQty((prev) => ({ ...prev, [ing.id]: Number(v) }))
                            }
                            w={80}
                        />
                        <Button size="xs" onClick={() => handlePurchase(ing.id)}>
                            Buy
                        </Button>
                    </Stack>
                </td>
            </tr>
        )
    })

    return (
        <div>
            <Title order={5} mb="sm">
                Inventory
            </Title>
            <ScrollArea h={260}>
                <Card p={0} shadow="xs">
                    <Table withColumnBorders horizontalSpacing="sm" verticalSpacing="xs">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Purchase</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length ? rows : (
                                <tr>
                                    <td colSpan={4}>
                                        <Text ta="center">No ingredients</Text>
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
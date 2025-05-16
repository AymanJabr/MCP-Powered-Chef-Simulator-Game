'use client'

import { Badge, Button, Card, Group, ScrollArea, Table, Text, Title } from '@mantine/core'
import { useRestaurantStore } from '@/state/game/restaurantStore'

export default function CustomerArea() {
    const { restaurant, actions } = useRestaurantStore()

    const handleSeat = (customerId: string) => {
        // Generate a simple table id – incrementing based on current active customers
        const tableNumber = restaurant.activeCustomers.length + 1
        const tableId = `table_${tableNumber}`
        actions.seatCustomer(customerId, tableId)
    }

    const queueRows = restaurant.customerQueue.map((c) => (
        <tr key={c.id}>
            <td>{c.id}</td>
            <td>{c.patience.toFixed(0)}</td>
            <td>
                <Button size="xs" onClick={() => handleSeat(c.id)}>
                    Seat
                </Button>
            </td>
        </tr>
    ))

    const activeRows = restaurant.activeCustomers.map((c) => {
        const order = restaurant.activeOrders.find((o) => o.customerId === c.id)
        return (
            <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.tableId ?? '–'}</td>
                <td>{order ? order.status : 'Waiting'}</td>
                <td>{c.satisfaction}</td>
            </tr>
        )
    })

    return (
        <div>
            <Group justify="space-between" mb="sm">
                <Title order={5}>Customers</Title>
                <Badge color="blue" variant="filled">
                    Seated {restaurant.activeCustomers.length} / {restaurant.customerCapacity}
                </Badge>
            </Group>
            <ScrollArea h={220} mb="md">
                <Card shadow="xs" p={0}>
                    <Table highlightOnHover withColumnBorders horizontalSpacing="sm" verticalSpacing="xs">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Table</th>
                                <th>Order Status</th>
                                <th>Satisfaction</th>
                            </tr>
                        </thead>
                        <tbody>{activeRows.length ? activeRows : <tr><td colSpan={4}><Text ta="center">No active customers</Text></td></tr>}</tbody>
                    </Table>
                </Card>
            </ScrollArea>

            <Title order={6} mb="xs">
                Waiting Queue ({restaurant.customerQueue.length})
            </Title>
            <ScrollArea h={160}>
                <Card shadow="xs" p={0}>
                    <Table withColumnBorders horizontalSpacing="sm" verticalSpacing="xs">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patience</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>{queueRows.length ? queueRows : <tr><td colSpan={3}><Text ta="center">Queue empty</Text></td></tr>}</tbody>
                    </Table>
                </Card>
            </ScrollArea>
        </div>
    )
} 
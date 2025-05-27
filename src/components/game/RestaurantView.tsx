'use client'

import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { useState, useEffect } from 'react'
import { Customer, PrepStation, CookingStation, PlatingStation, CookingProcess, Order } from '@/types/models'
import InventoryPanel from './InventoryPanel'
import CustomerPatienceDisplay from './CustomerPatienceDisplay'
import CustomerSprite from './CustomerSprite'
import TableIcon from '../icons/TableIcon'
import StatusBar from './restaurant/StatusBar'
import QueueArea from './restaurant/QueueArea'
import DiningArea from './restaurant/DiningArea'
import KitchenArea from './restaurant/KitchenArea'
import OrdersArea from './restaurant/OrdersArea'
import ControlsArea from './restaurant/ControlsArea'
import SelectionInfoPanel from './restaurant/SelectionInfoPanel'

export interface GameSelection {
    type: 'customer' | 'table' | 'station' | 'order' | 'ingredient' | null
    id: string | null
    data?: any
}

interface Position {
    x: number
    y: number
}

interface MovingEntity {
    id: string
    position: Position
    targetPosition?: Position
    isMoving: boolean
}

// Table positions within dining area
const TABLE_POSITIONS = [
    { id: 'table_1', x: 20, y: 25 },
    { id: 'table_2', x: 35, y: 25 },
    { id: 'table_3', x: 50, y: 25 },
    { id: 'table_4', x: 20, y: 45 },
    { id: 'table_5', x: 35, y: 45 },
    { id: 'table_6', x: 50, y: 45 },
    { id: 'table_7', x: 20, y: 65 },
    { id: 'table_8', x: 35, y: 65 }
]

// Queue positions
export const QUEUE_POSITIONS = [
    { x: 50, y: 15 },
    { x: 50, y: 25 },
    { x: 50, y: 35 },
    { x: 50, y: 45 }
]

// Define restaurant layout areas (in percentage coordinates)
export const AREAS = {
    STATUS: { x: 0, y: 0, width: 100, height: 5 },

    QUEUE: { x: 0, y: 5, width: 15, height: 80 },
    DINING: { x: 15, y: 5, width: 45, height: 80 },

    KITCHEN_PREP: { x: 60, y: 5, width: 40, height: 25.3 },
    KITCHEN_COOK: { x: 80, y: 30.3, width: 20, height: 37.9 },
    KITCHEN_PLATE: { x: 60, y: 68.2, width: 40, height: 16.8 },

    ORDERS: { x: 15, y: 70, width: 45, height: 15 },

    CONTROLS: { x: 0, y: 85, width: 100, height: 15 }
}

export default function RestaurantView() {
    const { game } = useGameStore()
    const { restaurant, actions } = useRestaurantStore()
    const kitchen = useKitchenStore()

    const [selection, setSelection] = useState<GameSelection>({ type: null, id: null })
    const [chefPosition, setChefPosition] = useState<Position>({ x: 40, y: 50 })
    const [movingCustomers, setMovingCustomers] = useState<Record<string, MovingEntity>>({})
    const [showInventoryPanel, setShowInventoryPanel] = useState(false)

    // Animation function for smooth movement
    const moveEntityTo = (entityId: string, targetPos: Position, duration: number = 1000) => {
        setMovingCustomers(prev => ({
            ...prev,
            [entityId]: {
                id: entityId,
                position: prev[entityId]?.position || targetPos,
                targetPosition: targetPos,
                isMoving: true
            }
        }))

        setTimeout(() => {
            setMovingCustomers(prev => ({
                ...prev,
                [entityId]: {
                    ...prev[entityId],
                    position: targetPos,
                    isMoving: false,
                    targetPosition: undefined
                }
            }))
        }, duration)
    }

    const handleCustomerSelect = (customerId: string) => {
        setSelection({ type: 'customer', id: customerId })
    }

    const handleCustomerClick = (customerId: string, tableId: string | undefined) => {
        if (!tableId) return; // Should not happen if customer is seated

        const customerAtTable = restaurant.activeCustomers.find(c => c.id === customerId);

        if (customerAtTable && customerAtTable.status === 'seated' && !customerAtTable.order) {
            const placeholderDishId = restaurant.unlockedMenuItems && restaurant.unlockedMenuItems.length > 0
                ? restaurant.unlockedMenuItems[0]
                : 'dish_burger_001';

            const result = actions.takeOrder(tableId, placeholderDishId);
            if (result.success) {
                console.log(result.message, result.order);
                const tablePos = TABLE_POSITIONS.find(t => t.id === tableId);
                if (tablePos) {
                    setChefPosition({ x: tablePos.x - 5, y: tablePos.y + 5 });
                    setTimeout(() => {
                        setChefPosition({ x: 40, y: 50 });
                    }, 1500);
                }
            } else {
                console.warn(result.message);
            }
            setSelection({ type: 'customer', id: customerId, data: { tableId } });
        } else {
            setSelection({ type: 'customer', id: customerId, data: { tableId } });
        }
    };

    const handleTableClick = (tableId: string) => {
        const customerAtTable = restaurant.activeCustomers.find(c => c.tableId === tableId);

        if (selection.type === 'customer' && selection.id) {
            const result = actions.seatCustomer(selection.id, tableId)
            if (result.success) {
                const tablePos = TABLE_POSITIONS.find(t => t.id === tableId)
                if (tablePos) {
                    const queueIndex = restaurant.customerQueue.findIndex(c => c.id === selection.id)
                    const startPos = QUEUE_POSITIONS[queueIndex] || QUEUE_POSITIONS[0]

                    setMovingCustomers(prev => ({
                        ...prev,
                        [selection.id!]: {
                            id: selection.id!,
                            position: { x: startPos.x, y: startPos.y },
                            targetPosition: { x: tablePos.x, y: tablePos.y },
                            isMoving: true
                        }
                    }))

                    setTimeout(() => {
                        setChefPosition({ x: tablePos.x - 5, y: tablePos.y + 5 })
                    }, 500)
                    setTimeout(() => {
                        setChefPosition({ x: 40, y: 50 })
                    }, 2000)

                    setTimeout(() => {
                        setMovingCustomers(prev => ({
                            ...prev,
                            [selection.id!]: {
                                ...prev[selection.id!],
                                position: { x: tablePos.x, y: tablePos.y },
                                isMoving: false,
                                targetPosition: undefined
                            }
                        }))
                    }, 1000)
                }
                setSelection({ type: null, id: null })
            }
        } else if (customerAtTable && customerAtTable.status === 'seated' && !customerAtTable.order) {
            const placeholderDishId = restaurant.unlockedMenuItems && restaurant.unlockedMenuItems.length > 0
                ? restaurant.unlockedMenuItems[0]
                : 'dish_burger_001';

            const result = actions.takeOrder(tableId, placeholderDishId);
            if (result.success) {
                console.log(result.message, result.order);
                const tablePos = TABLE_POSITIONS.find(t => t.id === tableId);
                if (tablePos) {
                    setChefPosition({ x: tablePos.x - 5, y: tablePos.y + 5 });
                    setTimeout(() => {
                        setChefPosition({ x: 40, y: 50 });
                    }, 1500);
                }
            } else {
                console.warn(result.message);
            }
            setSelection({ type: 'table', id: tableId });
        } else {
            setSelection({ type: 'table', id: tableId })
        }
    }

    const handleStationClick = (stationId: string, stationType: 'prep' | 'cooking' | 'plating') => {
        setSelection({ type: 'station', id: stationId, data: { type: stationType } })
        if (stationType === 'prep') {
            setChefPosition({ x: 75, y: 25 })
        } else if (stationType === 'cooking') {
            setChefPosition({ x: 85, y: 45 })
        } else if (stationType === 'plating') {
            setChefPosition({ x: 75, y: 85 })
        }
    }

    return (
        <div className="h-screen w-screen bg-amber-50 relative overflow-hidden">
            {/* Status Bar */}
            <StatusBar
                funds={restaurant.funds}
                timeElapsed={game.timeElapsed}
                customerQueueLength={restaurant.customerQueue.length}
                customerCapacity={restaurant.customerCapacity}
                reputation={restaurant.reputation}
                gameMode={game.gameMode}
                areaStyle={AREAS.STATUS}
            />

            {/* Queue Area */}
            <QueueArea
                customerQueue={restaurant.customerQueue}
                selection={selection}
                onCustomerSelect={handleCustomerSelect}
                areaStyle={AREAS.QUEUE}
                queuePositions={QUEUE_POSITIONS}
            />

            {/* Dining Area */}
            <DiningArea
                activeCustomers={restaurant.activeCustomers}
                selection={selection}
                movingCustomers={movingCustomers}
                chefPosition={chefPosition}
                tablePositions={TABLE_POSITIONS}
                onCustomerClick={handleCustomerClick}
                onTableClick={handleTableClick}
                areaStyle={AREAS.DINING}
            />

            {/* Kitchen Area */}
            <KitchenArea
                prepStations={kitchen.prepStations}
                cookingStations={kitchen.cookingStations}
                platingStations={kitchen.platingStations}
                activeCookingProcesses={kitchen.activeCookingProcesses}
                onStationClick={handleStationClick}
                prepAreaStyle={AREAS.KITCHEN_PREP}
                cookAreaStyle={AREAS.KITCHEN_COOK}
                plateAreaStyle={AREAS.KITCHEN_PLATE}
            />

            {/* Active Orders Area */}
            <OrdersArea
                activeOrders={restaurant.activeOrders}
                onOrderSelect={(orderId) => setSelection({ type: 'order', id: orderId })}
                areaStyle={AREAS.ORDERS}
            />

            {/* Control Panel */}
            <ControlsArea
                onManageInventoryClick={() => setShowInventoryPanel(true)}
                areaStyle={AREAS.CONTROLS}
            />

            {/* Inventory Panel Modal - Rendered at the root of RestaurantView for proper modal behavior */}
            <InventoryPanel
                isOpen={showInventoryPanel}
                onClose={() => setShowInventoryPanel(false)}
            />

            {/* Selection Info Panel (overlay) */}
            <SelectionInfoPanel
                selection={selection}
                onClose={() => setSelection({ type: null, id: null })}
            />
        </div>
    )
} 
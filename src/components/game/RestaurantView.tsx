'use client'

import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { usePlayerStore } from '@/state/player/playerStore'
import { useState, useEffect } from 'react'
import { Customer, PrepStation, CookingStation, PlatingStation, CookingProcess, Order, Position as PlayerStorePosition } from '@/types/models'
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

    ORDERS: { x: 15, y: 85, width: 45, height: 15 },

    CONTROLS: { x: 0, y: 85, width: 100, height: 15 }
}

export default function RestaurantView() {
    const { game } = useGameStore()
    const { restaurant, actions: restaurantActions } = useRestaurantStore()
    const kitchen = useKitchenStore()
    const { player, actions: playerActions } = usePlayerStore()

    const [selection, setSelection] = useState<GameSelection>({ type: null, id: null })
    const [movingCustomers, setMovingCustomers] = useState<Record<string, MovingEntity>>({})
    const [showInventoryPanel, setShowInventoryPanel] = useState(false)

    useEffect(() => {
        // Set initial chef position in the dining area when the view loads.
        // Using x: 60, y: 45 as a starting point to the right of the tables.
        // The player.position (which is the default {x:0,y:0,area:'kitchen'}) is passed as oldPosition.
        playerActions.setPosition({ x: 70, y: 45, area: 'dining' }, player.position);
    }, [playerActions]); // Runs once on mount because playerActions is stable

    const moveChefTo = (newPos: { x: number, y: number }, targetArea: PlayerStorePosition['area']) => {
        playerActions.setPosition({ ...newPos, area: targetArea }, player.position);
    };

    const handleCustomerSelect = (customerId: string) => {
        setSelection({ type: 'customer', id: customerId })
    }

    const handleCustomerClick = (customerId: string, tableId: string | undefined) => {
        if (!tableId) return;
        const customerAtTable = restaurant.activeCustomers.find(c => c.id === customerId);
        if (customerAtTable && customerAtTable.status === 'seated' && !customerAtTable.order) {
            const placeholderDishId = restaurant.unlockedMenuItems && restaurant.unlockedMenuItems.length > 0
                ? restaurant.unlockedMenuItems[0]
                : 'dish_burger_001';
            const result = restaurantActions.takeOrder(tableId, placeholderDishId);
            if (result.success) {
                const tablePos = TABLE_POSITIONS.find(t => t.id === tableId);
                if (tablePos) {
                    moveChefTo({ x: tablePos.x - 5, y: tablePos.y + 5 }, 'dining');
                    setTimeout(() => {
                        moveChefTo({ x: 40, y: 50 }, 'dining');
                    }, 1500);
                }
            } else { console.warn(result.message); }
            setSelection({ type: 'customer', id: customerId, data: { tableId } });
        } else {
            setSelection({ type: 'customer', id: customerId, data: { tableId } });
        }
    };

    const handleTableClick = (tableId: string) => {
        const customerAtTable = restaurant.activeCustomers.find(c => c.tableId === tableId);
        if (selection.type === 'customer' && selection.id) {
            const result = restaurantActions.seatCustomer(selection.id, tableId)
            if (result.success) {
                const tablePos = TABLE_POSITIONS.find(t => t.id === tableId)
                if (tablePos) {
                    const queueIndex = restaurant.customerQueue.findIndex(c => c.id === selection.id)
                    const startPos = QUEUE_POSITIONS[queueIndex] || QUEUE_POSITIONS[0]
                    setMovingCustomers(prev => ({ ...prev, [selection.id!]: { id: selection.id!, position: { x: startPos.x, y: startPos.y }, targetPosition: { x: tablePos.x, y: tablePos.y }, isMoving: true } }));
                    setTimeout(() => {
                        moveChefTo({ x: tablePos.x - 5, y: tablePos.y + 5 }, 'dining');
                    }, 500)
                    setTimeout(() => {
                        moveChefTo({ x: 40, y: 50 }, 'dining');
                    }, 2000)
                    setTimeout(() => {
                        setMovingCustomers(prev => ({ ...prev, [selection.id!]: { ...prev[selection.id!], position: { x: tablePos.x, y: tablePos.y }, isMoving: false, targetPosition: undefined } }));
                    }, 1000)
                }
                setSelection({ type: null, id: null })
            }
        } else if (customerAtTable && customerAtTable.status === 'seated' && !customerAtTable.order) {
            const placeholderDishId = restaurant.unlockedMenuItems && restaurant.unlockedMenuItems.length > 0 ? restaurant.unlockedMenuItems[0] : 'dish_burger_001';
            const result = restaurantActions.takeOrder(tableId, placeholderDishId);
            if (result.success) {
                const tablePos = TABLE_POSITIONS.find(t => t.id === tableId);
                if (tablePos) {
                    moveChefTo({ x: tablePos.x - 5, y: tablePos.y + 5 }, 'dining');
                    setTimeout(() => {
                        moveChefTo({ x: 40, y: 50 }, 'dining');
                    }, 1500);
                }
            } else { console.warn(result.message); }
            setSelection({ type: 'table', id: tableId });
        } else {
            setSelection({ type: 'table', id: tableId })
        }
    }

    const handleStationClick = (stationId: string, stationType: 'prep' | 'cooking' | 'plating') => {
        setSelection({ type: 'station', id: stationId, data: { type: stationType } })
        // These X, Y are percentages relative to the overall view. They need to be mapped to player.position.area and specific coordinates within that area.
        // For now, using 'kitchen' as the area. The actual x,y in the player store should ideally be normalized for that area or absolute.
        if (stationType === 'prep') {
            moveChefTo({ x: AREAS.KITCHEN_PREP.x + AREAS.KITCHEN_PREP.width / 2, y: AREAS.KITCHEN_PREP.y + AREAS.KITCHEN_PREP.height / 2 }, 'kitchen');
        } else if (stationType === 'cooking') {
            moveChefTo({ x: AREAS.KITCHEN_COOK.x + AREAS.KITCHEN_COOK.width / 2, y: AREAS.KITCHEN_COOK.y + AREAS.KITCHEN_COOK.height / 2 }, 'kitchen');
        } else if (stationType === 'plating') {
            moveChefTo({ x: AREAS.KITCHEN_PLATE.x + AREAS.KITCHEN_PLATE.width / 2, y: AREAS.KITCHEN_PLATE.y + AREAS.KITCHEN_PLATE.height / 2 }, 'kitchen');
        }
    }

    const handleOrderClick = (orderId: string) => {
        setSelection({ type: 'order', id: orderId });
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
                chefPosition={{ x: player.position.x, y: player.position.y }}
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
                onOrderSelect={handleOrderClick}
                areaStyle={AREAS.ORDERS}
            />

            {/* Control Panel */}
            <ControlsArea
                onManageInventoryClick={() => setShowInventoryPanel(true)}
                areaStyle={AREAS.CONTROLS}
            />

            {/* Selection Info Panel (overlay) */}
            {selection.type && selection.id && (
                <SelectionInfoPanel
                    selection={selection}
                    onClose={() => setSelection({ type: null, id: null })}
                />
            )}

            {/* Inventory Panel Modal - Rendered at the root of RestaurantView for proper modal behavior */}
            {showInventoryPanel && (
                <InventoryPanel
                    isOpen={showInventoryPanel}
                    onClose={() => setShowInventoryPanel(false)}
                />
            )}
        </div>
    )
} 
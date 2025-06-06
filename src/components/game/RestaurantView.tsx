'use client'

import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { usePlayerStore } from '@/state/player/playerStore'
import { useState, useEffect, useRef } from 'react'
import { Position as PlayerStorePosition, Order } from '@/types/models'
import InventoryPanel from './InventoryPanel'
import StatusBar from './restaurant/StatusBar'
import QueueArea from './restaurant/QueueArea'
import DiningArea from './restaurant/DiningArea'
import KitchenArea from './restaurant/KitchenArea'
import ControlsArea from './restaurant/ControlsArea'
import SelectionInfoPanel from './restaurant/SelectionInfoPanel'
import ManageDishesModal from './restaurant/ManageDishesModal'
import { calculateMaxOrderableDifficulty } from '@/lib/gameLoop'

// Define specific data payloads for each selection type
interface CustomerSelectionData {
    tableId?: string;
}

interface StationSelectionData {
    type: 'prep' | 'cooking' | 'plating';
}

// Redefine GameSelection as a discriminated union
export type GameSelection =
    | { type: 'customer'; id: string; data: CustomerSelectionData }
    | { type: 'table'; id: string; data?: undefined }
    | { type: 'station'; id: string; data: StationSelectionData }
    | { type: 'order'; id: string; data?: undefined }
    | { type: 'ingredient'; id: string; data?: undefined }
    | { type: null; id: null; data?: undefined };

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
    { x: 50, y: 45 },
    { x: 50, y: 55 },
    { x: 50, y: 65 },
    { x: 50, y: 75 },
    { x: 50, y: 85 }
]

// Define restaurant layout areas (in percentage coordinates)
export const AREAS = {
    STATUS: { x: 0, y: 0, width: 100, height: 5 },

    QUEUE: { x: 0, y: 5, width: 15, height: 80 },
    DINING: { x: 15, y: 5, width: 45, height: 80 },

    KITCHEN: { x: 60, y: 5, width: 40, height: 80 },

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
    const [isManageDishesModalOpen, setIsManageDishesModalOpen] = useState(false)
    const [orderToFocusInModal, setOrderToFocusInModal] = useState<string | null>(null)
    const initializedPosition = useRef(false);

    useEffect(() => {
        if (!initializedPosition.current) {
            if (player.position.x !== 70 || player.position.y !== 45 || player.position.area !== 'dining') {
                playerActions.setPosition({ x: 70, y: 45, area: 'dining' }, player.position);
            }
            initializedPosition.current = true;
        }
    }, [playerActions, player.position]);

    const moveChefTo = (newPos: { x: number, y: number }, targetArea: PlayerStorePosition['area']) => {
        playerActions.setPosition({ ...newPos, area: targetArea }, player.position);
    };

    const handleCustomerSelect = (customerId: string) => {
        setSelection({ type: 'customer', id: customerId, data: {} })
    }

    const handleCustomerClick = (customerId: string, tableId: string | undefined) => {
        if (!tableId) return;
        const customerAtTable = restaurant.activeCustomers.find(c => c.id === customerId);
        if (customerAtTable && customerAtTable.status === 'seated' && !customerAtTable.order) {
            console.log(`Selected customer ${customerId} at table ${tableId} who is ready to order.`);
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
                        setMovingCustomers(prev => ({ ...prev, [selection.id!]: { ...prev[selection.id!], position: { x: tablePos.x, y: tablePos.y }, isMoving: false, targetPosition: undefined } }));
                        setSelection({ type: 'table', id: tableId });
                    }, 1000)
                }
            }
        } else if (customerAtTable && customerAtTable.status === 'seated' && !customerAtTable.order) {
            console.log(`Selected table ${tableId} with a customer ready to order for SelectionInfoPanel.`);
            setSelection({ type: 'table', id: tableId });
        } else {
            setSelection({ type: 'table', id: tableId })
        }
    }

    const handleStationClick = (stationId: string, stationType: 'prep' | 'cooking' | 'plating') => {
        setSelection({ type: 'station', id: stationId, data: { type: stationType } })
        moveChefTo({ x: AREAS.KITCHEN.x + AREAS.KITCHEN.width / 2, y: AREAS.KITCHEN.y + AREAS.KITCHEN.height / 2 }, 'kitchen');
    }

    const initiateTakeOrderAndOpenManageModal = (tableId: string) => {
        const customer = restaurant.activeCustomers.find(c => c.tableId === tableId && c.status === 'seated' && !c.order);
        if (!customer) {
            console.warn("No customer ready to order at table:", tableId);
            return;
        }

        const maxDifficulty = calculateMaxOrderableDifficulty(game.difficulty);
        const orderableDishes = restaurant.menuItems?.filter(dish => dish.cookingDifficulty <= maxDifficulty) || [];

        if (orderableDishes.length === 0) {
            console.warn("No orderable dishes available at current difficulty.");
            return;
        }

        const randomDish = orderableDishes[Math.floor(Math.random() * orderableDishes.length)];
        if (!randomDish) {
            console.error("Failed to select a random dish.");
            return;
        }

        const result = restaurantActions.takeOrder(tableId, randomDish.id);
        if (result.success && result.order) {
            console.log(`Order taken for ${result.order.dish.name}, preparing directly.`);
            setOrderToFocusInModal(result.order.id);
            setIsManageDishesModalOpen(true);
            moveChefTo({ x: AREAS.KITCHEN.x + 10, y: AREAS.KITCHEN.y + 10 }, 'kitchen');
        } else {
            console.error("Failed to take order:", result.message);
        }
    };

    return (
        <div className="h-screen w-screen bg-amber-50 relative overflow-hidden">
            {/* Status Bar */}
            <StatusBar
                funds={restaurant.funds}
                timeElapsed={game.timeElapsed}
                customerQueueLength={restaurant.customerQueue.length}
                customerCapacity={restaurant.customerCapacity}
                lostCustomers={restaurant.lostCustomers}
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
                activeCookingProcesses={kitchen.activeCookingProcesses}
                onStationClick={handleStationClick}
                kitchenAreaStyle={AREAS.KITCHEN}
            />

            {/* Control Panel */}
            <ControlsArea
                onOpenInventory={() => setShowInventoryPanel(true)}
                controlsAreaStyle={AREAS.CONTROLS}
                kitchenAreaStyle={AREAS.KITCHEN}
                onOpenManageDishesModal={() => {
                    setOrderToFocusInModal(null);
                    setIsManageDishesModalOpen(true);
                }}
            />

            {/* Selection Info Panel (overlay) */}
            {selection.type && selection.id && (
                <SelectionInfoPanel
                    selection={selection}
                    onClose={() => setSelection({ type: null, id: null })}
                    onTakeOrderAndPrepare={initiateTakeOrderAndOpenManageModal}
                />
            )}

            {/* Inventory Panel Modal */}
            {showInventoryPanel && (
                <InventoryPanel
                    isOpen={showInventoryPanel}
                    onClose={() => setShowInventoryPanel(false)}
                />
            )}

            {/* Manage Dishes Modal */}
            {isManageDishesModalOpen && (
                <ManageDishesModal
                    initialSelectedOrderId={orderToFocusInModal}
                    isOpen={isManageDishesModalOpen}
                    onClose={() => {
                        setIsManageDishesModalOpen(false);
                        setOrderToFocusInModal(null);
                    }}
                />
            )}
        </div>
    )
} 
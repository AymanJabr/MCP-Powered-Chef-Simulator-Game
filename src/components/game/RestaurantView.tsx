'use client'

import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { useState, useEffect } from 'react'
import { Customer, PrepStation, CookingStation, PlatingStation } from '@/types/models'

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

// Define restaurant layout areas (in percentage coordinates)
const AREAS = {
    QUEUE: { x: 0, y: 10, width: 15, height: 90 },
    DINING: { x: 15, y: 10, width: 45, height: 60 },
    KITCHEN_PREP: { x: 60, y: 10, width: 40, height: 25 },
    KITCHEN_COOK: { x: 80, y: 35, width: 20, height: 45 },
    KITCHEN_PLATE: { x: 60, y: 80, width: 40, height: 20 },
    STATUS: { x: 0, y: 0, width: 100, height: 10 },
    ORDERS: { x: 15, y: 70, width: 45, height: 15 },
    CONTROLS: { x: 15, y: 85, width: 45, height: 15 }
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
const QUEUE_POSITIONS = [
    { x: 7, y: 20 },
    { x: 7, y: 35 },
    { x: 7, y: 50 },
    { x: 7, y: 65 }
]

export default function RestaurantView() {
    const { game } = useGameStore()
    const { restaurant, actions } = useRestaurantStore()
    const kitchen = useKitchenStore()

    const [selection, setSelection] = useState<GameSelection>({ type: null, id: null })
    const [chefPosition, setChefPosition] = useState<Position>({ x: 40, y: 50 })
    const [movingCustomers, setMovingCustomers] = useState<Record<string, MovingEntity>>({})

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

    const handleTableClick = (tableId: string) => {
        if (selection.type === 'customer' && selection.id) {
            const result = actions.seatCustomer(selection.id, tableId)
            if (result.success) {
                // Animate customer walking to table
                const tablePos = TABLE_POSITIONS.find(t => t.id === tableId)
                if (tablePos) {
                    // Set initial customer position at queue entrance
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

                    // Animate chef walking to greet customer at table
                    setTimeout(() => {
                        setChefPosition({ x: tablePos.x - 5, y: tablePos.y + 5 })
                    }, 500)

                    // Chef returns to center after seating customer
                    setTimeout(() => {
                        setChefPosition({ x: 40, y: 50 })
                    }, 2000)

                    // Customer sits down after walking animation
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
        } else {
            setSelection({ type: 'table', id: tableId })
        }
    }

    const handleStationClick = (stationId: string, stationType: 'prep' | 'cooking' | 'plating') => {
        setSelection({ type: 'station', id: stationId, data: { type: stationType } })

        // Move chef towards the kitchen area
        if (stationType === 'prep') {
            setChefPosition({ x: 75, y: 25 })
        } else if (stationType === 'cooking') {
            setChefPosition({ x: 85, y: 45 })
        } else if (stationType === 'plating') {
            setChefPosition({ x: 75, y: 85 })
        }
    }

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const formatCurrency = (amount: number): string => {
        return `$${amount.toFixed(2)}`
    }

    const renderStars = (rating: number): string => {
        const maxStars = 5
        const clampedRating = Math.max(0, Math.min(maxStars, rating))
        const fullStars = Math.floor(clampedRating)
        const hasHalfStar = (clampedRating % 1) >= 0.5

        let stars = '★'.repeat(fullStars)
        if (hasHalfStar) stars += '☆'
        const remainingStars = maxStars - Math.ceil(clampedRating)
        stars += '☆'.repeat(remainingStars)

        return stars
    }

    return (
        <div className="h-screen w-screen bg-amber-50 relative overflow-hidden">
            {/* Status Bar */}
            <div
                className="absolute bg-slate-800 text-white px-4 flex items-center justify-between text-sm"
                style={{
                    left: `${AREAS.STATUS.x}%`,
                    top: `${AREAS.STATUS.y}%`,
                    width: `${AREAS.STATUS.width}%`,
                    height: `${AREAS.STATUS.height}%`
                }}
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-green-400">💰</span>
                        <span className="font-semibold">{formatCurrency(restaurant.funds)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⏰</span>
                        <span>{formatTime(game.timeElapsed)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-blue-400">👥</span>
                        <span>{restaurant.customerQueue.length}/{restaurant.customerCapacity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span>{renderStars(restaurant.reputation)}</span>
                        <span className="text-xs text-gray-300">({restaurant.reputation.toFixed(1)})</span>
                    </div>
                </div>
                <div className="font-semibold">
                    {game.gameMode === 'mcp' ? 'MCP-Chef' : 'Human-Chef'}
                </div>
            </div>

            {/* Queue Area */}
            <div
                className="absolute bg-blue-100 border-r-2 border-blue-200"
                style={{
                    left: `${AREAS.QUEUE.x}%`,
                    top: `${AREAS.QUEUE.y}%`,
                    width: `${AREAS.QUEUE.width}%`,
                    height: `${AREAS.QUEUE.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-lg font-bold text-blue-800 mb-2 text-center">
                        🚶‍♂️ Entrance
                    </div>

                    {/* Queue customers */}
                    {restaurant.customerQueue.map((customer, index) => {
                        const queuePos = QUEUE_POSITIONS[index] || QUEUE_POSITIONS[QUEUE_POSITIONS.length - 1]
                        const isSelected = selection.type === 'customer' && selection.id === customer.id

                        return (
                            <div
                                key={customer.id}
                                className={`absolute cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'
                                    }`}
                                style={{
                                    left: `${queuePos.x}%`,
                                    top: `${queuePos.y + 5}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                onClick={() => handleCustomerSelect(customer.id)}
                            >
                                <div className={`w-10 h-14 rounded-lg border-2 flex flex-col items-center justify-center
                                    ${isSelected ? 'border-blue-500 bg-blue-200' : 'border-gray-300 bg-white'}
                                `}>
                                    <div className="text-xl">👤</div>
                                    <div className="text-xs">{customer.patience.toFixed(0)}%</div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Selection hint */}
                    {selection.type === 'customer' && (
                        <div className="absolute bottom-2 left-2 right-2 bg-blue-200 rounded p-1 text-xs text-center">
                            💡 Click a table to seat customer
                        </div>
                    )}
                </div>
            </div>

            {/* Dining Area */}
            <div
                className="absolute bg-green-100"
                style={{
                    left: `${AREAS.DINING.x}%`,
                    top: `${AREAS.DINING.y}%`,
                    width: `${AREAS.DINING.width}%`,
                    height: `${AREAS.DINING.height}%`
                }}
            >
                <div className="text-xl font-bold text-green-800 p-2 text-center">
                    🍽️ Dining Area
                </div>

                {/* Tables */}
                {TABLE_POSITIONS.map((tablePos) => {
                    const customer = restaurant.activeCustomers.find(c => c.tableId === tablePos.id)
                    const isSelected = selection.type === 'table' && selection.id === tablePos.id

                    return (
                        <div
                            key={tablePos.id}
                            className={`absolute w-12 h-12 rounded-lg border-2 cursor-pointer transition-all duration-300
                                ${customer ? 'bg-blue-200 border-blue-500' : 'bg-gray-200 border-gray-400'}
                                ${isSelected ? 'ring-4 ring-blue-400' : ''}
                                hover:shadow-lg hover:scale-105
                            `}
                            style={{
                                left: `${tablePos.x - 15}%`,
                                top: `${tablePos.y - 10}%`
                            }}
                            onClick={() => handleTableClick(tablePos.id)}
                        >
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="text-xs font-bold">
                                    {tablePos.id.replace('table_', 'T')}
                                </div>
                                {customer && (
                                    <div className="text-lg">👤</div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {/* Moving customers */}
                {Object.values(movingCustomers).map((entity) => (
                    <div
                        key={entity.id}
                        className={`absolute w-8 h-12 transition-all duration-1000 ease-in-out z-20`}
                        style={{
                            left: `${entity.targetPosition?.x || entity.position.x}%`,
                            top: `${entity.targetPosition?.y || entity.position.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="text-3xl">🚶‍♂️</div>
                    </div>
                ))}

                {/* Chef */}
                <div
                    className="absolute w-8 h-12 transition-all duration-500 z-10"
                    style={{
                        left: `${chefPosition.x}%`,
                        top: `${chefPosition.y}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="text-3xl">👨‍🍳</div>
                </div>
            </div>

            {/* Kitchen - Prep Stations (Top) */}
            <div
                className="absolute bg-orange-100 border-b border-orange-200"
                style={{
                    left: `${AREAS.KITCHEN_PREP.x}%`,
                    top: `${AREAS.KITCHEN_PREP.y}%`,
                    width: `${AREAS.KITCHEN_PREP.width}%`,
                    height: `${AREAS.KITCHEN_PREP.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-sm font-bold text-orange-800 mb-2">🔪 Prep Stations</div>
                    <div className="grid grid-cols-4 gap-2">
                        {kitchen.prepStations.map((station) => (
                            <div
                                key={station.id}
                                className={`w-12 h-12 rounded border-2 cursor-pointer flex flex-col items-center justify-center text-xs
                                    ${station.status === 'busy' ? 'bg-yellow-200 border-yellow-500' : 'bg-green-200 border-green-500'}
                                `}
                                onClick={() => handleStationClick(station.id, 'prep')}
                            >
                                <div className="text-lg">
                                    {station.type === 'cutting_board' ? '🔪' :
                                        station.type === 'mixing_bowl' ? '🥄' :
                                            station.type === 'blender' ? '🍹' : '🥣'}
                                </div>
                                <div>{station.status === 'busy' ? 'Busy' : 'Ready'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kitchen - Cooking Stations (Right) */}
            <div
                className="absolute bg-red-100 border-l border-red-200"
                style={{
                    left: `${AREAS.KITCHEN_COOK.x}%`,
                    top: `${AREAS.KITCHEN_COOK.y}%`,
                    width: `${AREAS.KITCHEN_COOK.width}%`,
                    height: `${AREAS.KITCHEN_COOK.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-sm font-bold text-red-800 mb-2">🔥 Cooking</div>
                    <div className="space-y-2">
                        {kitchen.cookingStations.map((station) => {
                            const process = kitchen.activeCookingProcesses.find(p => p.stationId === station.id)
                            return (
                                <div
                                    key={station.id}
                                    className={`w-16 h-16 rounded border-2 cursor-pointer flex flex-col items-center justify-center text-xs relative
                                        ${station.status === 'busy' ? 'bg-red-200 border-red-500' : 'bg-blue-200 border-blue-500'}
                                    `}
                                    onClick={() => handleStationClick(station.id, 'cooking')}
                                >
                                    <div className="text-lg">
                                        {station.type === 'stove' ? '🔥' :
                                            station.type === 'oven' ? '🔥' :
                                                station.type === 'grill' ? '🥩' :
                                                    station.type === 'fryer' ? '🍟' : '💨'}
                                    </div>
                                    <div>{station.temperature}°</div>
                                    {process && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                                            <div
                                                className="h-1 bg-orange-500 transition-all duration-500"
                                                style={{ width: `${Math.min(process.progress, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Kitchen - Plating Stations (Bottom) */}
            <div
                className="absolute bg-purple-100 border-t border-purple-200"
                style={{
                    left: `${AREAS.KITCHEN_PLATE.x}%`,
                    top: `${AREAS.KITCHEN_PLATE.y}%`,
                    width: `${AREAS.KITCHEN_PLATE.width}%`,
                    height: `${AREAS.KITCHEN_PLATE.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-sm font-bold text-purple-800 mb-2">🍽️ Plating</div>
                    <div className="grid grid-cols-2 gap-2">
                        {kitchen.platingStations.map((station) => (
                            <div
                                key={station.id}
                                className={`w-16 h-12 rounded border-2 cursor-pointer flex flex-col items-center justify-center text-xs
                                    ${station.status === 'busy' ? 'bg-purple-200 border-purple-500' : 'bg-pink-200 border-pink-500'}
                                `}
                                onClick={() => handleStationClick(station.id, 'plating')}
                            >
                                <div className="text-lg">🍽️</div>
                                <div>{station.status === 'busy' ? 'Busy' : 'Ready'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Orders Area */}
            <div
                className="absolute bg-gray-100 border-t-2 border-gray-200"
                style={{
                    left: `${AREAS.ORDERS.x}%`,
                    top: `${AREAS.ORDERS.y}%`,
                    width: `${AREAS.ORDERS.width}%`,
                    height: `${AREAS.ORDERS.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-sm font-bold text-gray-800 mb-1">📋 Active Orders</div>
                    <div className="flex gap-2 overflow-x-auto">
                        {restaurant.activeOrders.length === 0 ? (
                            <div className="text-gray-500 text-xs">No active orders</div>
                        ) : (
                            restaurant.activeOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className={`min-w-24 h-8 rounded border cursor-pointer flex items-center justify-between px-2
                                        ${order.status === 'received' ? 'bg-gray-200 border-gray-400' :
                                            order.status === 'cooking' ? 'bg-orange-200 border-orange-500' :
                                                order.status === 'plated' ? 'bg-green-200 border-green-500' :
                                                    'bg-blue-200 border-blue-500'}
                                    `}
                                    onClick={() => setSelection({ type: 'order', id: order.id })}
                                >
                                    <div className="text-xs">
                                        <div className="font-medium truncate">{order.dish.name}</div>
                                    </div>
                                    {order.isPriority && <span className="text-red-500 text-xs">🔥</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div
                className="absolute bg-slate-100 border-t-2 border-slate-300"
                style={{
                    left: `${AREAS.CONTROLS.x}%`,
                    top: `${AREAS.CONTROLS.y}%`,
                    width: `${AREAS.CONTROLS.width}%`,
                    height: `${AREAS.CONTROLS.height}%`
                }}
            >
                <div className="p-2 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            onClick={() => {
                                console.log('Spawn customer clicked')
                            }}
                        >
                            👥 Spawn Customer
                        </button>
                        <button
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                            onClick={() => {
                                setChefPosition({ x: 30, y: 40 })
                                setTimeout(() => setChefPosition({ x: 40, y: 50 }), 1000)
                            }}
                        >
                            📝 Take Orders
                        </button>
                        <button
                            className="px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
                            onClick={() => {
                                console.log('Restock clicked')
                            }}
                        >
                            📦 Restock
                        </button>
                    </div>

                    <div className="text-xs text-gray-600">
                        Game Mode: {game.gameMode.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Selection Info Panel (overlay) */}
            {selection.type && selection.id && (
                <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-blue-500 z-30 max-w-xs">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-sm capitalize">{selection.type} Selected</h3>
                        <button
                            onClick={() => setSelection({ type: null, id: null })}
                            className="text-gray-500 hover:text-gray-700 text-lg"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="text-xs text-gray-600">
                        ID: <span className="font-mono">{selection.id}</span>
                    </div>
                    {selection.data && (
                        <pre className="text-xs mt-1 bg-gray-100 p-1 rounded max-w-full overflow-auto">
                            {JSON.stringify(selection.data, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    )
} 
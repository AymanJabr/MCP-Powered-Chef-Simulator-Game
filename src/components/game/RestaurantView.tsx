'use client'

import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { useState } from 'react'
import StatusBar from './StatusBar'
import CustomerQueue from './CustomerQueue'
import DiningArea from './DiningArea'
import KitchenView from './KitchenView'
import ActiveOrders from './ActiveOrders'
import DetailedWorkArea from './DetailedWorkArea'

export interface GameSelection {
    type: 'customer' | 'table' | 'station' | 'order' | 'ingredient' | null
    id: string | null
    data?: any
}

export default function RestaurantView() {
    const { game } = useGameStore()
    const { restaurant } = useRestaurantStore()
    const kitchen = useKitchenStore()

    const [selection, setSelection] = useState<GameSelection>({ type: null, id: null })

    return (
        <div className="h-screen flex flex-col bg-amber-50">
            {/* Top Status Bar */}
            <StatusBar
                funds={restaurant.funds}
                reputation={restaurant.reputation}
                queueLength={restaurant.customerQueue.length}
                capacity={restaurant.customerCapacity}
                timeElapsed={game.timeElapsed}
            />

            {/* Main Game Area */}
            <div className="flex flex-1 gap-2 p-2">
                {/* Customer Queue */}
                <div className="w-48 bg-blue-100 rounded-lg p-2">
                    <CustomerQueue
                        customers={restaurant.customerQueue}
                        onCustomerSelect={(id: string) => setSelection({ type: 'customer', id })}
                        selectedCustomerId={selection.type === 'customer' ? selection.id : null}
                    />
                </div>

                {/* Dining Area */}
                <div className="flex-1 bg-green-100 rounded-lg p-4">
                    <DiningArea
                        activeCustomers={restaurant.activeCustomers}
                        capacity={restaurant.customerCapacity}
                        onTableSelect={(id: string) => setSelection({ type: 'table', id })}
                        selectedTableId={selection.type === 'table' ? selection.id : null}
                        selection={selection}
                        onSelectionChange={setSelection}
                    />
                </div>

                {/* Kitchen Area */}
                <div className="w-80 bg-orange-100 rounded-lg p-2">
                    <KitchenView
                        prepStations={kitchen.prepStations}
                        cookingStations={kitchen.cookingStations}
                        platingStations={kitchen.platingStations}
                        activeCookingProcesses={kitchen.activeCookingProcesses}
                        onStationSelect={(id: string, type: 'prep' | 'cooking' | 'plating') => setSelection({ type: 'station', id, data: { stationType: type } })}
                        selectedStationId={selection.type === 'station' ? selection.id : null}
                    />
                </div>
            </div>

            {/* Active Orders Bar */}
            <div className="h-20 bg-purple-100 mx-2 rounded-lg mb-2 p-2">
                <ActiveOrders
                    orders={restaurant.activeOrders}
                    onOrderSelect={(id: string) => setSelection({ type: 'order', id })}
                    selectedOrderId={selection.type === 'order' ? selection.id : null}
                />
            </div>

            {/* Detailed Work Area */}
            <div className="h-48 bg-gray-100 mx-2 rounded-lg mb-2 p-2">
                <DetailedWorkArea
                    selection={selection}
                    onSelectionChange={setSelection}
                    inventory={restaurant.inventory}
                    gameMode={game.gameMode}
                />
            </div>
        </div>
    )
} 
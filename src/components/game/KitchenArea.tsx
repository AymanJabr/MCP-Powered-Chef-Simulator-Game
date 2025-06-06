'use client'

import { Badge, Card, Progress, ScrollArea, Table, Text, Title } from '@mantine/core'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { CookingProcess, Equipment } from '@/types/models'
import { useRestaurantStore } from '@/state/game/restaurantStore'

interface KitchenAreaProps {
    activeCookingProcesses: CookingProcess[]
    onStationClick: (stationId: string, type: 'cooking' | 'prep' | 'plating') => void
    kitchenAreaStyle: {
        x: number
        y: number
        width: number
        height: number
    }
}

export default function KitchenArea({
    activeCookingProcesses,
    onStationClick,
    kitchenAreaStyle
}: KitchenAreaProps) {
    const { restaurant } = useRestaurantStore();

    // Create a map to count active processes for each station
    const stationUsage = activeCookingProcesses.reduce((acc, process) => {
        if (process.status === 'in_progress') {
            acc[process.stationId] = (acc[process.stationId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return (
        <div
            className="absolute bg-green-100 border-l-2 border-green-300"
            style={{
                left: `${kitchenAreaStyle.x}%`,
                top: `${kitchenAreaStyle.y}%`,
                width: `${kitchenAreaStyle.width}%`,
                height: `${kitchenAreaStyle.height}%`
            }}
        >
            <div className="p-4 grid grid-cols-3 gap-4 h-full">
                {restaurant.equipment.map((item: Equipment) => {
                    const usage = stationUsage[item.id] || 0;
                    const isBroken = item.status === 'broken';
                    const isInUse = usage > 0;

                    let statusClass = 'border-gray-300 hover:border-blue-400';
                    if (isBroken) {
                        statusClass = 'border-red-500 bg-red-200 opacity-60';
                    } else if (isInUse) {
                        statusClass = 'border-yellow-500';
                    }

                    return (
                        <div
                            key={item.id}
                            className={`relative flex flex-col items-center justify-center bg-white p-2 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${statusClass}`}
                            onClick={() => onStationClick(item.id, 'cooking')}
                            title={isBroken ? `${item.name} (Broken)` : item.name}
                        >
                            <img src={item.image} alt={item.name} className="h-16 w-16 object-contain mb-1" />
                            <p className="text-xs font-semibold text-center text-gray-700">{item.name}</p>
                            <div
                                className="absolute top-1 right-1 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                title={`Available Capacity: ${item.capacity - usage}/${item.capacity}`}
                            >
                                {item.capacity - usage}
                            </div>
                            {isBroken && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <p className="text-white font-bold text-sm">BROKEN</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
} 
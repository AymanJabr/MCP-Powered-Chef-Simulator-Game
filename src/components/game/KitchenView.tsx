'use client'

import { PrepStation, CookingStation, PlatingStation, CookingProcess } from '@/types/models'

interface KitchenViewProps {
    prepStations: PrepStation[]
    cookingStations: CookingStation[]
    platingStations: PlatingStation[]
    activeCookingProcesses: CookingProcess[]
    onStationSelect: (id: string, type: 'prep' | 'cooking' | 'plating') => void
    selectedStationId: string | null
}

function PrepStationCard({
    station,
    isSelected,
    onClick
}: {
    station: PrepStation
    isSelected: boolean
    onClick: () => void
}) {
    const statusColor = station.status === 'busy' ? 'bg-yellow-200 border-yellow-500' : 'bg-green-200 border-green-500'
    const icon = station.type === 'cutting_board' ? '🔪' :
        station.type === 'mixing_bowl' ? '🥄' :
            station.type === 'blender' ? '🍹' : '🥣'

    return (
        <div
            className={`
                w-16 h-16 rounded-lg border-2 cursor-pointer transition-all
                ${statusColor}
                ${isSelected ? 'ring-2 ring-blue-400' : ''}
                hover:shadow-md
            `}
            onClick={onClick}
        >
            <div className="h-full flex flex-col items-center justify-center">
                <div className="text-lg">{icon}</div>
                <div className="text-xs">{station.status === 'busy' ? 'Busy' : 'Ready'}</div>
            </div>
        </div>
    )
}

function CookingStationCard({
    station,
    process,
    isSelected,
    onClick
}: {
    station: CookingStation
    process?: CookingProcess
    isSelected: boolean
    onClick: () => void
}) {
    const statusColor = station.status === 'busy' ? 'bg-red-200 border-red-500' :
        station.status === 'broken' ? 'bg-gray-400 border-gray-600' :
            'bg-blue-200 border-blue-500'

    const icon = station.type === 'stove' ? '🔥' :
        station.type === 'oven' ? '🔥' :
            station.type === 'grill' ? '🥩' :
                station.type === 'fryer' ? '🍟' :
                    station.type === 'steamer' ? '💨' : '🍳'

    const progress = process ? Math.min(process.progress, 100) : 0

    return (
        <div
            className={`
                w-16 h-20 rounded-lg border-2 cursor-pointer transition-all relative
                ${statusColor}
                ${isSelected ? 'ring-2 ring-blue-400' : ''}
                hover:shadow-md
            `}
            onClick={onClick}
        >
            <div className="h-full flex flex-col items-center justify-center p-1">
                <div className="text-lg">{icon}</div>
                <div className="text-xs text-center">{station.type}</div>
                <div className="text-xs">{station.temperature}°</div>

                {process && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 rounded-b">
                        <div
                            className="h-1 bg-orange-500 rounded-b transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

function PlatingStationCard({
    station,
    isSelected,
    onClick
}: {
    station: PlatingStation
    isSelected: boolean
    onClick: () => void
}) {
    const statusColor = station.status === 'busy' ? 'bg-purple-200 border-purple-500' : 'bg-pink-200 border-pink-500'

    return (
        <div
            className={`
                w-16 h-16 rounded-lg border-2 cursor-pointer transition-all
                ${statusColor}
                ${isSelected ? 'ring-2 ring-blue-400' : ''}
                hover:shadow-md
            `}
            onClick={onClick}
        >
            <div className="h-full flex flex-col items-center justify-center">
                <div className="text-lg">🍽️</div>
                <div className="text-xs">{station.status === 'busy' ? 'Busy' : 'Ready'}</div>
            </div>
        </div>
    )
}

export default function KitchenView({
    prepStations,
    cookingStations,
    platingStations,
    activeCookingProcesses,
    onStationSelect,
    selectedStationId
}: KitchenViewProps) {
    return (
        <div className="h-full">
            <div className="text-lg font-bold text-orange-800 mb-4 text-center">
                🍳 Kitchen
            </div>

            {/* Prep Stations */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Prep Stations</div>
                <div className="grid grid-cols-4 gap-2">
                    {prepStations.map((station) => (
                        <PrepStationCard
                            key={station.id}
                            station={station}
                            isSelected={selectedStationId === station.id}
                            onClick={() => onStationSelect(station.id, 'prep')}
                        />
                    ))}
                </div>
            </div>

            {/* Cooking Stations */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Cooking Stations</div>
                <div className="grid grid-cols-3 gap-2">
                    {cookingStations.map((station) => {
                        const process = activeCookingProcesses.find(p => p.stationId === station.id && p.status === 'in_progress')
                        return (
                            <CookingStationCard
                                key={station.id}
                                station={station}
                                process={process}
                                isSelected={selectedStationId === station.id}
                                onClick={() => onStationSelect(station.id, 'cooking')}
                            />
                        )
                    })}
                </div>
            </div>

            {/* Plating Stations */}
            <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Plating</div>
                <div className="grid grid-cols-2 gap-2">
                    {platingStations.map((station) => (
                        <PlatingStationCard
                            key={station.id}
                            station={station}
                            isSelected={selectedStationId === station.id}
                            onClick={() => onStationSelect(station.id, 'plating')}
                        />
                    ))}
                </div>
            </div>

            {/* Kitchen Status */}
            <div className="bg-white rounded-lg p-2 text-xs">
                <div className="text-gray-600 mb-1">Station Status:</div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-200 border border-green-500 rounded"></div>
                        <span>Ready</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-200 border border-yellow-500 rounded"></div>
                        <span>Busy</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 border border-gray-600 rounded"></div>
                        <span>Broken</span>
                    </div>
                </div>
            </div>
        </div>
    )
} 
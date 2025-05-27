'use client'

import { PrepStation, CookingStation, PlatingStation, CookingProcess } from '@/types/models'

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface KitchenAreaProps {
    prepStations: PrepStation[];
    cookingStations: CookingStation[];
    platingStations: PlatingStation[];
    activeCookingProcesses: CookingProcess[];
    onStationClick: (stationId: string, stationType: 'prep' | 'cooking' | 'plating') => void;
    prepAreaStyle: AreaStyle;
    cookAreaStyle: AreaStyle;
    plateAreaStyle: AreaStyle;
}

export default function KitchenArea({
    prepStations,
    cookingStations,
    platingStations,
    activeCookingProcesses,
    onStationClick,
    prepAreaStyle,
    cookAreaStyle,
    plateAreaStyle
}: KitchenAreaProps) {
    return (
        <>
            {/* Kitchen - Prep Stations (Top) */}
            <div
                className="absolute bg-orange-100 border-b border-orange-200"
                style={{
                    left: `${prepAreaStyle.x}%`,
                    top: `${prepAreaStyle.y}%`,
                    width: `${prepAreaStyle.width}%`,
                    height: `${prepAreaStyle.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-sm font-bold text-orange-800 mb-2">🔪 Prep Stations</div>
                    <div className="grid grid-cols-4 gap-2">
                        {prepStations.map((station) => (
                            <div
                                key={station.id}
                                className={`w-12 h-12 rounded border-2 cursor-pointer flex flex-col items-center justify-center text-xs
                                    ${station.status === 'busy' ? 'bg-yellow-200 border-yellow-500' : 'bg-green-200 border-green-500'}
                                `}
                                onClick={() => onStationClick(station.id, 'prep')}
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
                    left: `${cookAreaStyle.x}%`,
                    top: `${cookAreaStyle.y}%`,
                    width: `${cookAreaStyle.width}%`,
                    height: `${cookAreaStyle.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-sm font-bold text-red-800 mb-2">🔥 Cooking</div>
                    <div className="space-y-2">
                        {cookingStations.map((station) => {
                            const process = activeCookingProcesses.find(p => p.stationId === station.id)
                            return (
                                <div
                                    key={station.id}
                                    className={`w-16 h-16 rounded border-2 cursor-pointer flex flex-col items-center justify-center text-xs relative
                                        ${station.status === 'busy' ? 'bg-red-200 border-red-500' : 'bg-blue-200 border-blue-500'}
                                    `}
                                    onClick={() => onStationClick(station.id, 'cooking')}
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
                    left: `${plateAreaStyle.x}%`,
                    top: `${plateAreaStyle.y}%`,
                    width: `${plateAreaStyle.width}%`,
                    height: `${plateAreaStyle.height}%`
                }}
            >
                <div className="p-2">
                    <div className="text-sm font-bold text-purple-800 mb-2">🍽️ Plating</div>
                    <div className="grid grid-cols-2 gap-2"> {/* Adjust grid columns as needed */}
                        {platingStations.map((station) => (
                            <div
                                key={station.id}
                                className={`w-16 h-12 rounded border-2 cursor-pointer flex flex-col items-center justify-center text-xs
                                    ${station.status === 'busy' ? 'bg-purple-200 border-purple-500' : 'bg-pink-200 border-pink-500'}
                                `}
                                onClick={() => onStationClick(station.id, 'plating')}
                            >
                                <div className="text-lg">🍽️</div>
                                <div>{station.status === 'busy' ? 'Busy' : 'Ready'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
} 
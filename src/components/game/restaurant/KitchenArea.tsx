'use client'

import { Equipment, CookingProcess } from '@/types/models';
import { useRestaurantStore } from '@/state/game/restaurantStore';
import { IconStack2, IconTool } from '@tabler/icons-react';
import Image from 'next/image';

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface KitchenAreaProps {
    activeCookingProcesses: CookingProcess[];
    onStationClick: (id: string, type: 'prep' | 'cooking' | 'plating') => void;
    kitchenAreaStyle: AreaStyle;
}

const inferStationType = (equipmentId: string): 'prep' | 'cooking' | 'plating' => {
    const id = equipmentId.toLowerCase();
    if (id.includes('cut') || id.includes('mix') || id.includes('prep') || id.includes('board') || id.includes('blender')) {
        return 'prep';
    }
    if (id.includes('plate') || id.includes('plating')) {
        return 'plating';
    }
    return 'cooking';
};

export default function KitchenArea({
    activeCookingProcesses,
    onStationClick,
    kitchenAreaStyle
}: KitchenAreaProps) {
    const { restaurant } = useRestaurantStore();
    const allEquipment = restaurant.equipment;

    const scrollbarStyles = `
        .kitchen-scroll-area::-webkit-scrollbar {
            width: 8px;
        }
        .kitchen-scroll-area::-webkit-scrollbar-track {
            background-color: #FFF7ED; /* Corresponds to orange-100 */
        }
        .kitchen-scroll-area::-webkit-scrollbar-thumb {
            background-color: #FDBA74; /* Corresponds to orange-300 */
            border-radius: 4px;
        }
        .kitchen-scroll-area::-webkit-scrollbar-thumb:hover {
            background-color: #FB923C; /* Corresponds to orange-400 */
        }
    `;

    return (
        <>
            <style>{scrollbarStyles}</style>
            <div
                className="absolute bg-orange-100 border border-orange-300 p-3 rounded-lg shadow-md flex flex-col"
                style={{
                    left: `${kitchenAreaStyle.x}%`,
                    top: `${kitchenAreaStyle.y}%`,
                    width: `${kitchenAreaStyle.width}%`,
                    height: `${kitchenAreaStyle.height}%`,
                    boxSizing: 'border-box'
                }}
            >
                <div className="text-orange-800 text-xl font-semibold mb-3 sticky top-0 bg-orange-100 py-2 z-20">Kitchen Equipment</div>

                <div className="kitchen-scroll-area flex-1 overflow-y-auto pr-2 pt-1 scrollbar-thin scrollbar-track-orange-100 scrollbar-thumb-orange-300 hover:scrollbar-thumb-orange-400 scrollbar-thumb-rounded-md">
                    {allEquipment.length === 0 && (
                        <div className="text-center text-orange-600 py-10">No equipment available.</div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                        {allEquipment.map((item: Equipment) => {
                            const process = activeCookingProcesses.find(p => p.stationId === item.id);
                            const stationType = inferStationType(item.id);

                            let reliabilityColor = 'bg-green-500';
                            if (item.reliability <= 30) reliabilityColor = 'bg-red-500';
                            else if (item.reliability <= 70) reliabilityColor = 'bg-yellow-500';

                            const isBroken = item.reliability === 0;
                            const needsAttention = item.reliability < 75 && item.reliability > 0;

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-lg shadow-md p-2 flex flex-col items-center relative ${isBroken ? 'cursor-default' : 'cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-orange-400'} transition-all`}
                                    onClick={() => !isBroken && onStationClick(item.id, stationType)}
                                    title={item.name}
                                >
                                    {isBroken && (
                                        <div
                                            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg z-20"
                                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                                        >
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log(`Fix equipment: ${item.id}`);
                                                }}
                                            >
                                                Fix Equipment
                                            </button>
                                        </div>
                                    )}
                                    <div className={`w-full flex items-center justify-between mb-1 ${isBroken ? 'opacity-50' : ''}`}>
                                        <p className="text-xs font-semibold text-orange-800 truncate text-left" title={item.name}>
                                            {item.name}
                                        </p>
                                        <div className="flex items-center text-2xs sm:text-xs text-gray-700" title={`Capacity: ${isBroken ? 0 : item.capacity}`}>
                                            {needsAttention && !isBroken && (
                                                <IconTool size={14} className="mr-0.5 text-yellow-600" title="Needs attention" />
                                            )}
                                            <IconStack2 size={14} className="mr-0.5 text-blue-500" />
                                            <span>{isBroken ? 0 : item.capacity}</span>
                                        </div>
                                    </div>
                                    <div className={`w-full mb-1 flex items-center justify-center rounded overflow-hidden ${isBroken ? 'opacity-50' : ''}`} style={{ maxHeight: '9rem' }}>
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={144}
                                                height={144}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs">No Img</span>
                                        )}
                                    </div>

                                    <div className={`w-3/4 mx-auto h-1.5 bg-gray-300 rounded-full my-1 ${isBroken ? 'opacity-50' : ''}`} title={`Reliability: ${item.reliability}%`}>
                                        <div
                                            className={`h-full ${reliabilityColor} rounded-full transition-all duration-300`}
                                            style={{ width: `${item.reliability}%` }}
                                        ></div>
                                    </div>

                                    {process && (
                                        <div className={`w-full mt-auto mb-0.5 px-1 ${isBroken ? 'opacity-50' : ''}`}>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(process.progress, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
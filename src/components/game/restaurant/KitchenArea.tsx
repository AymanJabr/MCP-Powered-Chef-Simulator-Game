'use client'

import { Equipment, CookingProcess } from '@/types/models';
import { useRestaurantStore } from '@/state/game/restaurantStore';
import { IconCircleCheck, IconCircleX, IconClockHour4 } from '@tabler/icons-react'; // Using Tabler Icons

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

    return (
        <div
            className="absolute bg-orange-100 border border-orange-300 overflow-y-auto p-3 rounded-lg shadow-md"
            style={{
                left: `${kitchenAreaStyle.x}%`,
                top: `${kitchenAreaStyle.y}%`,
                width: `${kitchenAreaStyle.width}%`,
                height: `${kitchenAreaStyle.height}%`,
                boxSizing: 'border-box'
            }}
        >
            <div className="text-orange-800 text-xl font-semibold mb-3 sticky top-0 bg-orange-100 py-2 z-10">Kitchen Equipment</div>
            {allEquipment.length === 0 && (
                <div className="text-center text-orange-600 py-10">No equipment available.</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                {allEquipment.map((item: Equipment) => {
                    const process = activeCookingProcesses.find(p => p.stationId === item.id);
                    const stationType = inferStationType(item.id);

                    let StatusIconComponent;
                    let statusColorClass = 'text-gray-500';

                    switch (item.status) {
                        case 'idle':
                            StatusIconComponent = IconCircleCheck;
                            statusColorClass = 'text-green-500';
                            break;
                        case 'in_use':
                            StatusIconComponent = IconClockHour4;
                            statusColorClass = 'text-yellow-500';
                            break;
                        case 'broken':
                            StatusIconComponent = IconCircleX;
                            statusColorClass = 'text-red-500';
                            break;
                        default:
                            StatusIconComponent = () => <span className="text-xs">?</span>;
                    }

                    return (
                        <div
                            key={item.id}
                            className={`bg-white rounded-lg shadow-md p-2 flex flex-col items-center justify-start cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-orange-400 transition-all`}
                            onClick={() => onStationClick(item.id, stationType)}
                            title={item.name}
                        >
                            <p className="text-xs font-medium text-orange-700 truncate w-full text-center mb-1" title={item.name}>
                                {item.name}
                            </p>
                            <div className="w-full h-32 sm:h-36 mb-1 flex items-center justify-center rounded overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-gray-400 text-xs">No Img</span>
                                )}
                            </div>

                            <div className="w-full flex justify-around items-center text-2xs sm:text-xs text-gray-600 px-0.5">
                                <div className="flex items-center" title={`Status: ${item.status.replace('_', ' ')}`}>
                                    <StatusIconComponent size={14} className={`mr-0.5 ${statusColorClass}`} />
                                    <span className="hidden sm:inline">{item.status.replace('_', ' ')}</span>
                                </div>
                                <div title={`Capacity: ${item.capacity}`}>C:{item.capacity}</div>
                                <div title={`Reliability: ${item.reliability}%`}>R:{item.reliability}%</div>
                            </div>

                            {process && (
                                <div className="w-full mt-1 px-0.5">
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className="bg-orange-500 h-1 rounded-full transition-all duration-300"
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
    );
} 
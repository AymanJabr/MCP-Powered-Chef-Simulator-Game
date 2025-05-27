'use client'

import { Customer } from '@/types/models'
import CustomerPatienceDisplay from '../CustomerPatienceDisplay'
import CustomerSprite from '../CustomerSprite'
import { GameSelection } from '../RestaurantView' // Assuming GameSelection and AREAS are exported from RestaurantView or a shared types file

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Position {
    x: number;
    y: number;
}

interface QueueAreaProps {
    customerQueue: Customer[];
    selection: GameSelection;
    onCustomerSelect: (customerId: string) => void;
    areaStyle: AreaStyle;
    queuePositions: Position[];
}

export default function QueueArea({
    customerQueue,
    selection,
    onCustomerSelect,
    areaStyle,
    queuePositions
}: QueueAreaProps) {
    return (
        <div
            className="absolute bg-blue-100 border-r-2 border-blue-200"
            style={{
                left: `${areaStyle.x}%`,
                top: `${areaStyle.y}%`,
                width: `${areaStyle.width}%`,
                height: `${areaStyle.height}%`
            }}
        >
            <div className="p-2">
                <div className="text-lg font-bold text-blue-800 mb-2 text-center">
                    🚶‍♂️ Entrance
                </div>

                {/* Customer in Queue */}
                {customerQueue.map((customer, index) => {
                    if (index >= queuePositions.length) return null; // Don't render if no position
                    const queuePos = queuePositions[index];
                    const isSelected = selection.type === 'customer' && selection.id === customer.id;

                    return (
                        <div
                            key={customer.id}
                            className={`absolute p-1 rounded cursor-pointer transition-all duration-300 ease-in-out 
                                        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : 'bg-gray-200 hover:bg-gray-300'}`}
                            style={{
                                left: `${queuePos.x}%`,
                                top: `${queuePos.y}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10
                            }}
                            onClick={() => onCustomerSelect(customer.id)}
                        >
                            <div className="flex flex-col items-center w-16">
                                <CustomerPatienceDisplay patience={customer.patience} />
                                {customer.spriteConfig && customer.animationState && customer.spriteConfig[customer.animationState] && (
                                    <CustomerSprite
                                        animationDetails={customer.spriteConfig[customer.animationState]!}
                                        className="mt-1"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Selection hint */}
                {selection.type === 'customer' && (
                    <div className="absolute bottom-2 left-2 right-2 bg-blue-200 rounded p-1 text-xs text-center">
                        💡 Click a table to seat customer
                    </div>
                )}
            </div>
        </div>
    );
} 
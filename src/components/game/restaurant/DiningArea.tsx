'use client'

import { Customer } from '@/types/models'
import CustomerPatienceDisplay from '../CustomerPatienceDisplay'
import CustomerSprite from '../CustomerSprite'
import ChefSprite from '../ChefSprite'
import type { GameSelection } from '../RestaurantView' // Assuming GameSelection and other types are available
// import TableIcon from '../../icons/TableIcon' // If needed

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

interface MovingEntity {
    id: string;
    position: Position;
    targetPosition?: Position;
    isMoving: boolean;
}

interface TablePosition extends Position {
    id: string;
}

interface DiningAreaProps {
    activeCustomers: Customer[];
    selection: GameSelection;
    movingCustomers: Record<string, MovingEntity>;
    chefPosition: Position;
    tablePositions: TablePosition[];
    onCustomerClick: (customerId: string, tableId: string | undefined) => void;
    onTableClick: (tableId: string) => void;
    areaStyle: AreaStyle;
}

export default function DiningArea({
    activeCustomers,
    selection,
    movingCustomers,
    chefPosition,
    tablePositions,
    onCustomerClick,
    onTableClick,
    areaStyle
}: DiningAreaProps) {
    return (
        <div
            className="absolute bg-green-100"
            style={{
                left: `${areaStyle.x}%`,
                top: `${areaStyle.y}%`,
                width: `${areaStyle.width}%`,
                height: `${areaStyle.height}%`
            }}
        >
            <div className="text-xl font-bold text-green-800 p-2 text-center">
                🍽️ Dining Area
            </div>

            {/* Seated Customers */}
            {activeCustomers.map((customer) => {
                if (!customer.tableId) return null;

                const tablePositionData = tablePositions.find(t => t.id === customer.tableId);
                if (!tablePositionData) return null;

                let currentX = tablePositionData.x;
                let currentY = tablePositionData.y;

                if (movingCustomers[customer.id]?.isMoving && movingCustomers[customer.id].position) {
                    currentX = movingCustomers[customer.id].position.x;
                    currentY = movingCustomers[customer.id].position.y;
                }

                const isSelected = selection.type === 'customer' && selection.id === customer.id;
                const hasOrder = customer.order !== null;

                return (
                    <div
                        key={customer.id}
                        className={`absolute p-1 rounded cursor-pointer transition-all duration-300 ease-in-out
                            ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : 'bg-transparent'}
                            ${hasOrder ? 'bg-green-200/70' : 'bg-red-200/70'} 
                        `}
                        style={{
                            left: `${currentX}%`,
                            top: `${currentY}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: movingCustomers[customer.id]?.isMoving ? 25 : 20,
                            transition: movingCustomers[customer.id]?.isMoving ? 'left 1s linear, top 1s linear' : 'none',
                            width: '60px'
                        }}
                        onClick={() => onCustomerClick(customer.id, customer.tableId)}
                    >
                        <div className="flex flex-col items-center">
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

            {/* Tables */}
            {tablePositions.map((tablePos) => {
                const customer = activeCustomers.find(c => c.tableId === tablePos.id)
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
                            left: `${tablePos.x}%`,
                            top: `${tablePos.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => onTableClick(tablePos.id)}
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

            {/* Chef */}
            <div
                className="absolute transition-all duration-500 z-10"
                style={{
                    left: `${chefPosition.x}%`,
                    top: `${chefPosition.y}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <ChefSprite />
            </div>
        </div>
    );
} 
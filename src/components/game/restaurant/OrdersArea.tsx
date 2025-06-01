'use client'

import { Order } from '@/types/models'

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface OrdersAreaProps {
    activeOrders: Order[];
    onOrderSelect: (orderId: string) => void; // Simplified from setSelection for this component
    areaStyle: AreaStyle;
}

export default function OrdersArea({
    activeOrders,
    onOrderSelect,
    areaStyle
}: OrdersAreaProps) {
    return (
        <div
            className="absolute bg-gray-100 border-t-2 border-gray-200"
            style={{
                left: `${areaStyle.x}%`,
                top: `${areaStyle.y}%`,
                width: `${areaStyle.width}%`,
                height: `${areaStyle.height}%`
            }}
        >
            <div className="p-2">
                <div className="text-sm font-bold text-gray-800 mb-1">📋 Active Orders</div>
                <div className="flex gap-2 overflow-x-auto">
                    {activeOrders.length === 0 ? (
                        <div className="text-gray-500 text-xs">No active orders</div>
                    ) : (
                        activeOrders.map((order) => (
                            <div
                                key={order.id}
                                className={`min-w-24 h-8 rounded border cursor-pointer flex items-center justify-between px-2
                                    ${order.status === 'received' ? 'bg-gray-200 border-gray-400' :
                                        order.status === 'cooking' ? 'bg-orange-200 border-orange-500' :
                                            order.status === 'plated' ? 'bg-green-200 border-green-500' :
                                                'bg-blue-200 border-blue-500'}
                                `}
                                onClick={() => onOrderSelect(order.id)}
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
    );
} 
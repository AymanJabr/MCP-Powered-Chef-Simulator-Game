'use client'

import { Customer } from '@/types/models'
import { GameSelection } from './RestaurantView'
import { useRestaurantStore } from '@/state/game/restaurantStore'

interface DiningAreaProps {
    activeCustomers: Customer[]
    capacity: number
    onTableSelect: (id: string) => void
    selectedTableId: string | null
    selection: GameSelection
    onSelectionChange: (selection: GameSelection) => void
}

function Table({
    id,
    customer,
    isSelected,
    onClick,
    onTakeOrder
}: {
    id: string
    customer: Customer | null
    isSelected: boolean
    onClick: () => void
    onTakeOrder: (customerId: string) => void
}) {
    const isEmpty = !customer
    const hasOrder = customer?.order !== null
    const needsOrder = customer && !customer.order

    const getTableColor = () => {
        if (isEmpty) return 'bg-gray-200 border-gray-400'
        if (customer.status === 'served') return 'bg-green-200 border-green-500'
        if (hasOrder) return 'bg-yellow-200 border-yellow-500'
        if (needsOrder) return 'bg-blue-200 border-blue-500'
        return 'bg-red-200 border-red-500'
    }

    const handleClick = () => {
        if (needsOrder) {
            onTakeOrder(customer.id)
        } else {
            onClick()
        }
    }

    return (
        <div
            className={`
                w-24 h-24 rounded-lg border-2 cursor-pointer transition-all relative
                ${getTableColor()}
                ${isSelected ? 'ring-4 ring-blue-400' : ''}
                hover:shadow-lg transform hover:scale-105
            `}
            onClick={handleClick}
        >
            <div className="absolute -top-2 -left-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border">
                {id.replace('table_', 'T')}
            </div>

            <div className="h-full flex flex-col items-center justify-center p-1">
                {isEmpty ? (
                    <div className="text-gray-400 text-sm">Empty</div>
                ) : (
                    <>
                        <div className="text-lg">👤</div>
                        <div className="text-xs text-center">
                            {customer.satisfaction.toFixed(0)}%
                        </div>

                        {needsOrder && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}

                        {hasOrder && (
                            <div className="absolute -bottom-1 -right-1 text-xs">
                                {customer.order?.status === 'served' ? '✅' : '🍽️'}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default function DiningArea({
    activeCustomers,
    capacity,
    onTableSelect,
    selectedTableId,
    selection,
    onSelectionChange
}: DiningAreaProps) {
    const { actions } = useRestaurantStore()

    // Generate table layout - 6 tables in 2 rows
    const tables = Array.from({ length: capacity }, (_, i) => {
        const tableId = `table_${i + 1}`
        const customer = activeCustomers.find(c => c.tableId === tableId)
        return { id: tableId, customer: customer || null }
    })

    const handleTableClick = (tableId: string, customer: Customer | null) => {
        // If we have a selected customer from queue, seat them
        if (selection.type === 'customer' && selection.id && !customer) {
            actions.seatCustomer(selection.id, tableId)
            onSelectionChange({ type: null, id: null })
            return
        }

        // Otherwise, select the table
        onTableSelect(tableId)
    }

    const handleTakeOrder = (customerId: string) => {
        // In a real implementation, this would open an order dialog
        // For now, we'll just select the customer
        onSelectionChange({ type: 'customer', id: customerId, data: { needsOrder: true } })
    }

    return (
        <div className="h-full">
            <div className="text-xl font-bold text-green-800 mb-4 text-center">
                🍽️ Dining Area ({activeCustomers.length}/{capacity})
            </div>

            <div className="grid grid-cols-3 gap-8 justify-items-center">
                {tables.map((table) => (
                    <Table
                        key={table.id}
                        id={table.id}
                        customer={table.customer}
                        isSelected={selectedTableId === table.id}
                        onClick={() => handleTableClick(table.id, table.customer)}
                        onTakeOrder={handleTakeOrder}
                    />
                ))}
            </div>

            <div className="mt-6 flex justify-center">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-gray-600 mb-2">Table Status:</div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded"></div>
                            <span>Empty</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-200 border border-blue-500 rounded"></div>
                            <span>Waiting</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-200 border border-yellow-500 rounded"></div>
                            <span>Ordered</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-200 border border-green-500 rounded"></div>
                            <span>Served</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 
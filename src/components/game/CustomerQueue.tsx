'use client'

import { Customer } from '@/types/models'

interface CustomerQueueProps {
    customers: Customer[]
    onCustomerSelect: (id: string) => void
    selectedCustomerId: string | null
}

function CustomerCard({
    customer,
    isSelected,
    onClick
}: {
    customer: Customer
    isSelected: boolean
    onClick: () => void
}) {
    const patienceColor = customer.patience > 70 ? 'bg-green-200' :
        customer.patience > 40 ? 'bg-yellow-200' : 'bg-red-200'

    const patienceBarWidth = Math.max(0, Math.min(100, customer.patience))

    return (
        <div
            className={`
                p-3 mb-2 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                hover:border-blue-400 hover:shadow-md
            `}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">👤 Customer</span>
                <span className="text-xs text-gray-600">
                    {customer.satisfaction.toFixed(0)}% 😊
                </span>
            </div>

            <div className="text-xs text-gray-500 mb-2">
                ID: {customer.id.slice(-8)}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${patienceColor}`}
                    style={{ width: `${patienceBarWidth}%` }}
                />
            </div>
            <div className="text-xs text-gray-600 mt-1">
                Patience: {customer.patience.toFixed(0)}%
            </div>

            {customer.order && (
                <div className="mt-2 p-1 bg-purple-100 rounded text-xs">
                    🍽️ {customer.order.dish.name}
                </div>
            )}
        </div>
    )
}

export default function CustomerQueue({
    customers,
    onCustomerSelect,
    selectedCustomerId
}: CustomerQueueProps) {
    return (
        <div className="h-full">
            <div className="text-lg font-bold text-blue-800 mb-4 text-center">
                🚶‍♂️ Queue ({customers.length})
            </div>

            <div className="space-y-2 overflow-y-auto max-h-full">
                {customers.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">😴</div>
                        <div>No customers waiting</div>
                    </div>
                ) : (
                    customers.map((customer) => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            isSelected={selectedCustomerId === customer.id}
                            onClick={() => onCustomerSelect(customer.id)}
                        />
                    ))
                )}
            </div>

            {selectedCustomerId && (
                <div className="mt-4 p-2 bg-blue-100 rounded text-xs text-center">
                    💡 Click an empty table to seat this customer
                </div>
            )}
        </div>
    )
} 
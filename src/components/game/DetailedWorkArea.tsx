'use client'

import { Ingredient, GameMode } from '@/types/models'
import { GameSelection } from './RestaurantView'
import { useState } from 'react'
import MCPInterface from '../mcp/MCPInterface'

interface DetailedWorkAreaProps {
    selection: GameSelection
    onSelectionChange: (selection: GameSelection) => void
    inventory: Ingredient[]
    gameMode: GameMode
}

function InventoryGrid({
    inventory,
    onIngredientSelect
}: {
    inventory: Ingredient[]
    onIngredientSelect: (id: string) => void
}) {
    const getIngredientIcon = (category: string) => {
        switch (category) {
            case 'meat': return '🥩'
            case 'vegetable': return '🥕'
            case 'dairy': return '🧀'
            case 'grain': return '🌾'
            case 'sauce': return '🥫'
            case 'spice': return '🧂'
            default: return '🥄'
        }
    }

    const getQuantityColor = (quantity: number) => {
        if (quantity === 0) return 'bg-red-100 border-red-400 text-red-700'
        if (quantity < 5) return 'bg-yellow-100 border-yellow-400 text-yellow-700'
        return 'bg-green-100 border-green-400 text-green-700'
    }

    return (
        <div className="grid grid-cols-6 gap-2">
            {inventory.map((ingredient) => (
                <div
                    key={ingredient.id}
                    className={`
                        p-2 rounded-lg border-2 cursor-pointer transition-all
                        ${getQuantityColor(ingredient.quantity)}
                        hover:shadow-md hover:scale-105
                    `}
                    onClick={() => onIngredientSelect(ingredient.id)}
                >
                    <div className="text-center">
                        <div className="text-2xl mb-1">{getIngredientIcon(ingredient.category)}</div>
                        <div className="text-xs font-medium truncate">{ingredient.name}</div>
                        <div className="text-xs">×{ingredient.quantity}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function OrderTakingDialog({
    customerId,
    onClose,
    onOrderPlace
}: {
    customerId: string
    onClose: () => void
    onOrderPlace: (dishId: string, customizations: string[]) => void
}) {
    const [selectedDish, setSelectedDish] = useState<string>('')
    const [customizations, setCustomizations] = useState<string[]>([])

    // Mock menu items - in real app this would come from props
    const menuItems = [
        { id: 'burger', name: 'Classic Burger', price: 12.99 },
        { id: 'pizza', name: 'Margherita Pizza', price: 14.99 },
        { id: 'salad', name: 'Caesar Salad', price: 9.99 },
        { id: 'pasta', name: 'Spaghetti Carbonara', price: 13.99 },
    ]

    const handleOrder = () => {
        if (selectedDish) {
            onOrderPlace(selectedDish, customizations)
            onClose()
        }
    }

    return (
        <div className="bg-white rounded-lg border-2 border-blue-500 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Take Order - Customer {customerId.slice(-6)}</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`
                            p-3 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedDish === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                            hover:border-blue-400
                        `}
                        onClick={() => setSelectedDish(item.id)}
                    >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">${item.price}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Cancel
                </button>
                <button
                    onClick={handleOrder}
                    disabled={!selectedDish}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Place Order
                </button>
            </div>
        </div>
    )
}

function SelectionDetails({ selection }: { selection: GameSelection }) {
    if (!selection.type || !selection.id) {
        return (
            <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">👆</div>
                <div>Select an item to see details</div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-lg font-bold mb-2 capitalize">
                {selection.type} Details
            </h3>
            <div className="text-sm text-gray-600">
                ID: {selection.id}
            </div>
            {selection.data && (
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                    {JSON.stringify(selection.data, null, 2)}
                </pre>
            )}
        </div>
    )
}

export default function DetailedWorkArea({
    selection,
    onSelectionChange,
    inventory,
    gameMode
}: DetailedWorkAreaProps) {
    const [showOrderDialog, setShowOrderDialog] = useState(false)

    // Check if we need to show order taking dialog
    const needsOrderTaking = selection.type === 'customer' && selection.data?.needsOrder

    const handleIngredientSelect = (ingredientId: string) => {
        onSelectionChange({ type: 'ingredient', id: ingredientId })
    }

    const handleOrderPlace = (dishId: string, customizations: string[]) => {
        // This would normally interact with the game store to place the order
        console.log('Placing order:', { dishId, customizations, customerId: selection.id })
        onSelectionChange({ type: null, id: null })
    }

    return (
        <div className="h-full flex gap-4">
            {/* Left Panel - Selection Details or Order Dialog */}
            <div className="flex-1">
                {needsOrderTaking ? (
                    <OrderTakingDialog
                        customerId={selection.id!}
                        onClose={() => onSelectionChange({ type: null, id: null })}
                        onOrderPlace={handleOrderPlace}
                    />
                ) : (
                    <SelectionDetails selection={selection} />
                )}
            </div>

            {/* Center Panel - Inventory */}
            <div className="flex-1">
                <div className="bg-white rounded-lg p-4 border h-full">
                    <h3 className="text-lg font-bold mb-4">📦 Inventory</h3>
                    <InventoryGrid
                        inventory={inventory}
                        onIngredientSelect={handleIngredientSelect}
                    />
                </div>
            </div>

            {/* Right Panel - Controls (MCP or Manual) */}
            <div className="flex-1">
                <div className="bg-white rounded-lg p-4 border h-full">
                    {gameMode === 'mcp' ? (
                        <MCPInterface />
                    ) : (
                        <div>
                            <h3 className="text-lg font-bold mb-4">🎮 Manual Controls</h3>
                            <div className="space-y-2">
                                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Spawn Customer
                                </button>
                                <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                                    Serve Plated Orders
                                </button>
                                <button className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                                    Restock Low Ingredients
                                </button>
                                <button className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                                    Pause Game
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 
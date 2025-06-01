import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRestaurantStore } from '@/state/game/restaurantStore';
import { Ingredient } from '@/types/models';

interface InventoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const InventoryPanel = ({ isOpen, onClose }: InventoryPanelProps) => {
    const { restaurant, actions } = useRestaurantStore();
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

    // Initialize restockQuantities with 1 for each ingredient
    const initialRestockQuantities = () => {
        const quantities: Record<string, number> = {};
        restaurant.inventory.forEach(ingredient => {
            quantities[ingredient.id] = 1;
        });
        return quantities;
    };
    const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>(initialRestockQuantities());

    // Effect to update default quantities if inventory changes (e.g., new items added)
    useEffect(() => {
        setRestockQuantities(prevQuantities => {
            const newQuantities = { ...prevQuantities };
            restaurant.inventory.forEach(ingredient => {
                if (newQuantities[ingredient.id] === undefined || newQuantities[ingredient.id] === 0) {
                    newQuantities[ingredient.id] = 1;
                }
            });
            return newQuantities;
        });
    }, [restaurant.inventory]);

    const handleQuantityChange = (ingredientId: string, quantity: string) => {
        const numQuantity = parseInt(quantity, 10);
        setRestockQuantities(prev => ({
            ...prev,
            // Ensure value is at least 1 if not empty, otherwise allow clearing for typing 0 then 1 (or handle differently)
            [ingredientId]: isNaN(numQuantity) ? 1 : (numQuantity < 1 && quantity !== '' ? 1 : numQuantity)
        }));
    };

    const handleRestock = (ingredient: Ingredient) => {
        const quantityToBuy = restockQuantities[ingredient.id] || 0;
        if (quantityToBuy <= 0) return;
        const totalCost = ingredient.cost * quantityToBuy;
        if (restaurant.funds < totalCost) return;
        actions.updateFunds(-totalCost);
        actions.updateIngredientQuantity(ingredient.id, quantityToBuy);
        setRestockQuantities(prev => ({ ...prev, [ingredient.id]: 1 }));
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const filteredInventory = restaurant.inventory.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Direct style for backdrop transparency
            onClick={handleBackdropClick}
        >
            <div className="bg-slate-100 p-4 rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">Manage Inventory</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-700 text-2xl"
                        title="Close Inventory"
                    >
                        &times;
                    </button>
                </div>

                {/* Search Input */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        className="w-full p-2 border border-slate-300 rounded text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-y-auto flex-grow pr-2">
                    {filteredInventory.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            {restaurant.inventory.length > 0 ? 'No ingredients match your search.' : 'No ingredients available.'}
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {filteredInventory.map((ingredient) => {
                                const currentQuantity = restockQuantities[ingredient.id] || 1;
                                return (
                                    <li key={ingredient.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                                        <div className="flex items-center flex-grow mr-2">
                                            {/* Image display */}
                                            {ingredient.image ? (
                                                <div className="relative w-10 h-10 rounded mr-3">
                                                    <Image 
                                                        src={ingredient.image} 
                                                        alt={ingredient.name}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-300 rounded mr-3 flex items-center justify-center text-xs text-gray-500">
                                                    N/A
                                                </div>
                                            )}
                                            <div className="flex-grow">
                                                <span className="font-medium text-slate-800 block">{ingredient.name}</span>
                                                <span className="text-xs text-slate-500">
                                                    (In Stock: {ingredient.quantity}, Cost: ${ingredient.cost.toFixed(2)} ea.)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0"> {/* Main group for quantity input and restock button */}
                                            {/* Custom Quantity Input Group */}
                                            <div className="flex items-center border border-slate-300 rounded">
                                                {currentQuantity > 1 && (
                                                    <button
                                                        onClick={() => handleQuantityChange(ingredient.id, (currentQuantity - 1).toString())}
                                                        className="w-6 h-6 flex items-center justify-center text-xs bg-gray-200 hover:bg-gray-300 focus:outline-none border-r border-slate-300"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        -
                                                    </button>
                                                )}
                                                <input
                                                    type="text"
                                                    value={currentQuantity}
                                                    onChange={(e) => handleQuantityChange(ingredient.id, e.target.value)}
                                                    onBlur={(e) => {
                                                        const value = parseInt(e.target.value, 10);
                                                        if (isNaN(value) || value < 1) {
                                                            setRestockQuantities(prev => ({ ...prev, [ingredient.id]: 1 }));
                                                        }
                                                    }}
                                                    className={`w-8 h-6 p-1 text-xs text-center outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 ${currentQuantity <= 1 ? 'rounded-l' : ''}`}
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(ingredient.id, (currentQuantity + 1).toString())}
                                                    className="w-6 h-6 flex items-center justify-center text-xs bg-gray-200 hover:bg-gray-300 focus:outline-none border-l border-slate-300"
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRestock(ingredient)}
                                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors disabled:bg-gray-400 h-6 flex items-center"
                                                disabled={(restockQuantities[ingredient.id] || 0) <= 0 || restaurant.funds < ingredient.cost * (restockQuantities[ingredient.id] || 0)}
                                            >
                                                Restock
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryPanel;
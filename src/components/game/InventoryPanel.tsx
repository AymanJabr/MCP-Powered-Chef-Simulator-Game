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
    const [searchTerm, setSearchTerm] = useState('');

    const initialRestockQuantities = () => {
        const quantities: Record<string, number> = {};
        restaurant.inventory.forEach(ingredient => {
            quantities[ingredient.id] = 1;
        });
        return quantities;
    };
    const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>(initialRestockQuantities());

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

    const scrollbarStyles = `
        .inventory-scroll-area::-webkit-scrollbar {
            width: 8px;
        }
        .inventory-scroll-area::-webkit-scrollbar-track {
            background-color: #FFEDD5; /* orange-100 */
        }
        .inventory-scroll-area::-webkit-scrollbar-thumb {
            background-color: #FDBA74; /* orange-300 */
            border-radius: 4px;
        }
        .inventory-scroll-area::-webkit-scrollbar-thumb:hover {
            background-color: #FB923C; /* orange-400 */
        }
    `;

    if (!isOpen) return null;

    const filteredInventory = restaurant.inventory.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <style>{scrollbarStyles}</style>
            <div
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                onClick={handleBackdropClick}
            >
                <div className="bg-orange-50 p-4 rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col text-orange-800">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-orange-700">Manage Inventory</h3>
                        <button
                            onClick={onClose}
                            className="text-orange-500 hover:text-orange-700 text-3xl"
                            title="Close Inventory"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            className="w-full p-2 border border-orange-300 rounded text-sm text-orange-800 placeholder-orange-400 focus:ring-orange-500 focus:border-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="inventory-scroll-area overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 hover:scrollbar-thumb-orange-400">
                        {filteredInventory.length === 0 ? (
                            <p className="text-sm text-orange-500">
                                {restaurant.inventory.length > 0 ? 'No ingredients match your search.' : 'No ingredients available.'}
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {filteredInventory.map((ingredient) => {
                                    const currentQuantity = restockQuantities[ingredient.id] || 1;
                                    return (
                                        <li key={ingredient.id} className="bg-white p-3 rounded-lg shadow-md flex items-center justify-between border border-orange-200">
                                            <div className="flex items-center flex-grow mr-2">
                                                {ingredient.image ? (
                                                    <div className="relative w-12 h-12 rounded-md mr-3 overflow-hidden">
                                                        <Image
                                                            src={ingredient.image}
                                                            alt={ingredient.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-orange-100 rounded-md mr-3 flex items-center justify-center text-xs text-orange-400">
                                                        N/A
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <span className="font-semibold text-orange-800 block text-md">{ingredient.name}</span>
                                                    <span className="text-xs text-orange-600">
                                                        (In Stock: {ingredient.quantity}, Cost: ${ingredient.cost.toFixed(2)} ea.)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="flex items-center border border-orange-300 rounded-md overflow-hidden">
                                                    {currentQuantity > 1 && (
                                                        <button
                                                            onClick={() => handleQuantityChange(ingredient.id, (currentQuantity - 1).toString())}
                                                            className="w-7 h-7 flex items-center justify-center text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 focus:outline-none"
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
                                                        className={`w-10 h-7 p-1 text-sm text-center text-orange-800 outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500 ${currentQuantity <= 1 ? 'rounded-l-md' : ''}`}
                                                    />
                                                    <button
                                                        onClick={() => handleQuantityChange(ingredient.id, (currentQuantity + 1).toString())}
                                                        className="w-7 h-7 flex items-center justify-center text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 focus:outline-none"
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleRestock(ingredient)}
                                                    className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors disabled:bg-orange-300 h-7 flex items-center"
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
        </>
    );
};

export default InventoryPanel;
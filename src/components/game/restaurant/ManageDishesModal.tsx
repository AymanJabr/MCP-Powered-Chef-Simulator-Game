'use client'

import { Order, Recipe, Ingredient as IngredientType, CookingStep, Equipment, PrepStation, CookingStation } from '@/types/models'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { IconX, IconToolsKitchen2, IconChefHat, IconCircleCheck, IconCircleDashed, IconHourglassHigh, IconFlame, IconAssembly, IconInfoCircle, IconListDetails } from '@tabler/icons-react'
import { useState, useEffect, MouseEvent } from 'react'

// Renamed props for clarity for the new modal
interface ManageDishesModalProps {
    // order: Order | null // Removed, modal will handle multiple orders
    initialSelectedOrderId?: string | null; // To optionally highlight an order
    isOpen: boolean
    onClose: () => void
}

// Helper to determine if a station is a PrepStation (already exists, good)
function isPrepStation(station: PrepStation | CookingStation): station is PrepStation {
    return 'type' in station && (station.type === 'cutting_board' || station.type === 'mixing_bowl' || station.type === 'blender' || station.type === 'rolling_pin' || station.type === 'mortar_pestle');
}

// Renamed component
export default function ManageDishesModal({ initialSelectedOrderId, isOpen, onClose }: ManageDishesModalProps) {
    const { restaurant } = useRestaurantStore()
    const { prepStations, cookingStations, activePreparations, activeCookingProcesses, actions: kitchenActions } = useKitchenStore()

    // State for the currently selected/focused order/task ID within this modal
    const [focusedTaskId, setFocusedTaskId] = useState<string | null>(initialSelectedOrderId || null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [allocatedIngredients, setAllocatedIngredients] = useState<Record<string, number>>({});
    const [feedbackMessage, setFeedbackMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const showFeedback = (text: string, type: 'success' | 'error') => {
        setFeedbackMessage({ text, type });
        setTimeout(() => setFeedbackMessage(null), 3000); // Hide after 3 seconds
    };

    // When focusedTaskId changes, try to find its recipe
    useEffect(() => {
        if (focusedTaskId) {
            // Attempt to find the order associated with focusedTaskId
            // This could be an orderId directly, or an ID from an activePreparation/activeCookingProcess
            // For now, let's assume focusedTaskId is an orderId for simplicity in this step
            const order = restaurant.activeOrders.find(o => o.id === focusedTaskId);
            if (order && restaurant.allRecipes) {
                const recipe = restaurant.allRecipes.find(r => r.id === order.dish.recipeId)
                setSelectedRecipe(recipe || null)
                setAllocatedIngredients({}); // Reset for the new focused order
            } else {
                setSelectedRecipe(null)
            }
        } else {
            setSelectedRecipe(null)
        }
    }, [focusedTaskId, restaurant.activeOrders, restaurant.allRecipes])

    // Update focusedTaskId if initialSelectedOrderId changes while modal is open
    useEffect(() => {
        setFocusedTaskId(initialSelectedOrderId || null);
    }, [initialSelectedOrderId]);


    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) {
        return null
    }

    // TODO: Logic to get all active tasks/orders for the left pane
    const ordersInProgress = restaurant.activeOrders.filter(
        o => o.status === 'received' || o.status === 'cooking' || o.status === 'plated'
    );
    // Further enhance this by linking to activePreparations and activeCookingProcesses for more detailed status.

    const focusedOrder = restaurant.activeOrders.find(o => o.id === focusedTaskId);

    const getIngredientNameAndStock = (id: string): { name: string, stock: number, cost: number, image?: string } => {
        const ingredient = restaurant.inventory.find(ing => ing.id === id)
        return {
            name: ingredient?.name || 'Unknown Ingredient',
            stock: ingredient?.quantity || 0,
            cost: ingredient?.cost || 0,
            image: ingredient?.image
        }
    }

    const getEquipmentDetails = (id: string): Equipment | undefined => {
        return restaurant.equipment.find(eq => eq.id === id);
    }

    const scrollbarStyles = `
        .manage-dishes-scroll-area::-webkit-scrollbar {
            width: 8px;
        }
        .manage-dishes-scroll-area::-webkit-scrollbar-track {
            background-color: #E0F2FE; /* sky-100 */
        }
        .manage-dishes-scroll-area::-webkit-scrollbar-thumb {
            background-color: #7DD3FC; /* sky-300 */
            border-radius: 4px;
        }
        .manage-dishes-scroll-area::-webkit-scrollbar-thumb:hover {
            background-color: #38BDF8; /* sky-400 */
        }
    `;

    return (
        <>
            <style>{scrollbarStyles}</style>
            <div
                className="fixed inset-0 flex items-center justify-center p-4 z-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                onClick={handleOverlayClick}
            >
                <div
                    className="bg-sky-50 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col text-sky-800" // Increased max-w for multi-view
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center border-b border-sky-200 pb-3 mb-4">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-sky-700 flex items-center">
                            <IconListDetails size={32} className="mr-2 sm:mr-3 text-sky-600" /> {/* Changed Icon */}
                            Manage Dishes & Kitchen Tasks
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-sky-500 hover:text-sky-700 transition-colors"
                            aria-label="Close modal"
                        >
                            <IconX size={28} />
                        </button>
                    </div>

                    {feedbackMessage && (
                        <div className={`p-2 mb-3 text-sm rounded-md text-center ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedbackMessage.text}
                        </div>
                    )}

                    <div className="flex-grow flex space-x-4 overflow-hidden">
                        {/* Left Pane: List of Active Orders/Tasks */}
                        <div className="w-1/3 border-r border-sky-200 pr-4 manage-dishes-scroll-area overflow-y-auto">
                            <h3 className="text-lg font-medium text-sky-700 mb-3 sticky top-0 bg-sky-50 py-1">Active Orders</h3>
                            {ordersInProgress.length === 0 && (
                                <p className="text-sm text-slate-500 italic">No dishes currently being prepared.</p>
                            )}
                            <ul className="space-y-2">
                                {ordersInProgress.map(order => (
                                    <li key={order.id}>
                                        <button
                                            onClick={() => setFocusedTaskId(order.id)}
                                            className={`w-full text-left p-2.5 rounded-md border transition-all duration-150 ease-in-out flex items-center space-x-3
                                                        ${focusedTaskId === order.id ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400' : 'bg-white hover:bg-sky-100 border-sky-200 hover:shadow-sm'}`}
                                        >
                                            {order.dish.image && (
                                                <img src={order.dish.image} alt={order.dish.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                            )}
                                            <div>
                                                <p className={`font-semibold text-sm ${focusedTaskId === order.id ? 'text-white' : 'text-sky-700'}`}>{order.dish.name}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Pane: Details of Focused Task */}
                        <div className="w-2/3 manage-dishes-scroll-area overflow-y-auto pl-1">
                            {!focusedOrder && (
                                <div className="text-center py-10 h-full flex flex-col items-center justify-center">
                                    <IconChefHat size={48} className="mx-auto mb-4 text-sky-300" />
                                    <p className="text-xl text-sky-600">Select an order to view details.</p>
                                    <p className="text-sm text-sky-500 mt-1">Details for its preparation will appear here.</p>
                                </div>
                            )}
                            {focusedOrder && !selectedRecipe && (
                                <div className="text-center py-10 h-full flex flex-col items-center justify-center">
                                    <IconCircleDashed size={48} className="mx-auto mb-4 text-yellow-500" />
                                    <p className="text-xl text-yellow-600">Recipe not found or loading for {focusedOrder.dish.name}...</p>
                                    <p className="text-sm text-slate-500 mt-1">Recipe ID: {focusedOrder.dish.recipeId}</p>
                                </div>
                            )}
                            {focusedOrder && selectedRecipe && (
                                <div className="space-y-5">
                                    <h3 className="text-xl font-medium text-sky-700 sticky top-0 bg-sky-50 py-1 z-10">Details for: {focusedOrder.dish.name}</h3>
                                    <div>
                                        <h4 className="text-md font-semibold text-sky-700 mb-2 border-b border-sky-200 pb-1 flex items-center">
                                            <IconToolsKitchen2 size={20} className="mr-2 text-amber-600" />
                                            Overall Required Ingredients
                                        </h4>
                                        <ul className="space-y-1 text-xs">
                                            {selectedRecipe.ingredients.map((ingId) => {
                                                const { name, stock, image } = getIngredientNameAndStock(ingId)
                                                return (
                                                    <li key={ingId} className="flex items-center p-1.5 bg-white rounded border border-sky-100">
                                                        {image && <img src={image} alt={name} className="w-8 h-8 rounded object-cover mr-3 flex-shrink-0" />}
                                                        <div className="flex-grow">
                                                            <span className="text-sky-800 font-medium">{name}</span>
                                                            <span className="text-sky-600 ml-2">
                                                                (Stock: {stock})
                                                            </span>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-semibold text-sky-700 mb-2 border-b border-sky-200 pb-1 flex items-center">
                                            <IconAssembly size={20} className="mr-2 text-green-600" />
                                            Cooking Steps
                                        </h4>
                                        {selectedRecipe.cookingSteps.map((step, index) => {
                                            const generalEquipmentInfo = getEquipmentDetails(step.equipmentId);
                                            let stationDetails: PrepStation | CookingStation | undefined =
                                                prepStations.find(s => s.id === step.equipmentId) ||
                                                cookingStations.find(s => s.id === step.equipmentId);

                                            const processId = `process_${focusedOrder.id}_${index}`;
                                            const activeProcess = activeCookingProcesses.find(p => p.id === processId);

                                            const isPreviousStepComplete = index === 0 || activeCookingProcesses.find(p => p.id === `process_${focusedOrder.id}_${index - 1}`)?.status === 'completed';

                                            return (
                                                <div key={index} className="bg-white p-3 rounded-lg mb-2.5 shadow-sm border border-sky-200">
                                                    <h5 className="text-sm font-semibold text-sky-700 mb-1.5 capitalize">
                                                        Step {index + 1}: {step.type.replace(/_/g, ' ')}
                                                    </h5>
                                                    <div className="text-xs space-y-0.5 text-sky-600 mb-2">
                                                        <p><IconHourglassHigh size={14} className="inline mr-1 text-yellow-500" />Duration: {step.duration}s</p>
                                                        <p>
                                                            <IconToolsKitchen2 size={14} className="inline mr-1 text-amber-500" />
                                                            Equip: {generalEquipmentInfo?.name || stationDetails?.id || 'Unknown'}
                                                            {stationDetails && (<span className="text-xs"> (Type: {stationDetails.type})</span>)}
                                                        </p>
                                                    </div>
                                                    {step.ingredientIds.length > 0 && (
                                                        <div className="mb-1.5">
                                                            <p className="text-xs font-medium text-sky-700 mb-1">Ingredients:</p>
                                                            <ul className="space-y-1.5">
                                                                {step.ingredientIds.map(id => {
                                                                    const { name, stock, image } = getIngredientNameAndStock(id);
                                                                    return (
                                                                        <li key={id} className="flex items-center text-xs text-sky-600">
                                                                            {image && <img src={image} alt={name} className="w-8 h-8 rounded object-cover mr-2 flex-shrink-0" />}
                                                                            <span>{name} (Stock: {stock})</span>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <div className="mt-2 text-right">
                                                        {!activeProcess && (
                                                            <button
                                                                onClick={() => {
                                                                    const result = kitchenActions.assignCookingStep(focusedOrder.id, step, index);
                                                                    showFeedback(result.message, result.success ? 'success' : 'error');
                                                                }}
                                                                disabled={!isPreviousStepComplete}
                                                                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                                                                title={!isPreviousStepComplete ? "Complete previous step first" : "Assign this step"}
                                                            >
                                                                Assign
                                                            </button>
                                                        )}
                                                        {activeProcess && activeProcess.status === 'in_progress' && (
                                                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                                <div
                                                                    className="bg-green-500 h-2.5 rounded-full"
                                                                    style={{ width: `${activeProcess.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        )}
                                                        {activeProcess && activeProcess.status === 'completed' && (
                                                            <p className="text-xs text-green-600 font-semibold flex items-center justify-end">
                                                                <IconCircleCheck size={14} className="mr-1" />
                                                                Step Complete
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {selectedRecipe.cookingSteps.length === 0 && (
                                            <p className="text-sm text-slate-500 italic"><IconInfoCircle size={16} className="inline mr-1" /> No steps.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-sky-200 flex justify-end">
                        <button
                            disabled={!focusedOrder || !selectedRecipe} // Basic disable logic
                            className="px-5 py-2 sm:px-6 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm flex items-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IconCircleCheck size={20} className="mr-2" />
                            Mark Focused as Complete (TODO)
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
} 
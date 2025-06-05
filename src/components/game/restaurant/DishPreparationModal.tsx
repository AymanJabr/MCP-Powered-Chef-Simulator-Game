'use client'

import { Order, Recipe, Ingredient as IngredientType, CookingStep, Equipment } from '@/types/models'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { useKitchenStore } from '@/state/game/kitchenStore'
import { IconX, IconToolsKitchen2, IconChefHat, IconCircleCheck, IconCircleDashed, IconHourglassHigh, IconFlame, IconAssembly } from '@tabler/icons-react'
import { useState, useEffect } from 'react'

interface DishPreparationModalProps {
    order: Order | null
    isOpen: boolean
    onClose: () => void
}

export default function DishPreparationModal({ order, isOpen, onClose }: DishPreparationModalProps) {
    const { restaurant, actions: restaurantActions } = useRestaurantStore()
    const { prepStations, cookingStations, platingStations, activePreparations, activeCookingProcesses, activePlating, actions: kitchenActions } = useKitchenStore()

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

    useEffect(() => {
        if (order && restaurant.allRecipes) {
            const recipe = restaurant.allRecipes.find(r => r.id === order.dish.recipeId)
            setSelectedRecipe(recipe || null)
        } else {
            setSelectedRecipe(null)
        }
    }, [order, restaurant.allRecipes])

    if (!isOpen || !order) {
        return null
    }

    const getIngredientName = (id: string): string => {
        const ingredient = restaurant.inventory.find(ing => ing.id === id)
        return ingredient?.name || 'Unknown Ingredient'
    }

    const getEquipmentName = (id: string): string => {
        // Combine all equipment types for lookup; consider a more robust lookup if IDs aren't globally unique
        const allEquipment = [...restaurant.equipment]; // Assuming restaurant.equipment holds general equipment
        const equipment = allEquipment.find(eq => eq.id === id)
        return equipment?.name || 'Unknown Equipment'
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-slate-800 text-slate-100 p-6 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-semibold text-sky-400 flex items-center">
                        <IconChefHat size={32} className="mr-3 text-sky-500" />
                        Prepare: {order.dish.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-sky-400 transition-colors"
                        aria-label="Close preparation modal"
                    >
                        <IconX size={30} />
                    </button>
                </div>

                {!selectedRecipe && (
                    <div className="text-center py-10">
                        <IconCircleDashed size={48} className="mx-auto mb-4 text-yellow-500" />
                        <p className="text-xl text-yellow-400">Recipe not found or loading...</p>
                        <p className="text-sm text-slate-400 mt-1">Recipe ID: {order.dish.recipeId}</p>
                    </div>
                )}

                {selectedRecipe && (
                    <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
                        <div>
                            <h3 className="text-xl font-medium text-amber-400 mb-3 border-b-2 border-amber-500/30 pb-2 flex items-center">
                                <IconToolsKitchen2 size={24} className="mr-2 text-amber-500" />
                                Required Ingredients
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                                {selectedRecipe.ingredients.map((ingId) => {
                                    const invItem = restaurant.inventory.find(i => i.id === ingId)
                                    return (
                                        <li key={ingId} className="text-sm">
                                            {getIngredientName(ingId)}
                                            <span className="text-xs text-slate-400 ml-2">
                                                (In stock: {invItem?.quantity ?? 0})
                                            </span>
                                            {/* TODO: Add "Allocate" button and logic */}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-medium text-green-400 mb-4 border-b-2 border-green-500/30 pb-2 flex items-center">
                                <IconAssembly size={24} className="mr-2 text-green-500" />
                                Cooking Steps
                            </h3>
                            {selectedRecipe.cookingSteps.map((step, index) => (
                                <div key={index} className="bg-slate-700/50 p-4 rounded-md mb-4 shadow">
                                    <h4 className="text-lg font-semibold text-sky-300 mb-2 capitalize">
                                        Step {index + 1}: {step.type.replace(/_/g, ' ')}
                                    </h4>
                                    <p className="text-sm text-slate-400 mb-1">
                                        <IconHourglassHigh size={16} className="inline mr-1 text-yellow-400" />
                                        Duration: {step.duration / 60000} min ({step.duration / 1000}s)
                                    </p>
                                    <p className="text-sm text-slate-400 mb-1">
                                        <IconToolsKitchen2 size={16} className="inline mr-1 text-amber-400" />
                                        Equipment: {getEquipmentName(step.equipmentId)}
                                    </p>
                                    {step.ingredientIds.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-300 mt-2 mb-1">Ingredients for this step:</p>
                                            <ul className="list-disc list-inside pl-4 text-xs text-slate-400">
                                                {step.ingredientIds.map(id => <li key={id}>{getIngredientName(id)}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {/* TODO: Add "Assign to Station" button and logic, show status */}
                                    <div className="mt-3 text-right">
                                        <button className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50">
                                            Assign to Station
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end space-x-3">
                    {/* TODO: Add "Complete Preparation & Plate" button */}
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50"
                    >
                        Close
                    </button>
                    <button
                        // onClick={handleStartPreparation} // TODO
                        disabled={!selectedRecipe}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <IconCircleCheck size={20} className="mr-2" />
                        Complete & Plate (Placeholder)
                    </button>
                </div>
            </div>
        </div>
    )
} 
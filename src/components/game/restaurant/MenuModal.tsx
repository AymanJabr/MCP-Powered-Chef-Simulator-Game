'use client'

import { useState } from 'react'
import { Dish, Recipe, Ingredient, CookingStep } from '@/types/models'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import Image from 'next/image'
import { IconChevronDown, IconChevronUp, IconX, IconToolsKitchen2, IconLeaf } from '@tabler/icons-react'

interface MenuModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
    const { restaurant } = useRestaurantStore()
    const { menuItems = [], allRecipes = [], inventory = [] } = restaurant

    const [activeDishId, setActiveDishId] = useState<string | null>(null)

    if (!isOpen) return null

    const getRecipeForDish = (dishId: string): Recipe | undefined => {
        const dish = menuItems.find(d => d.id === dishId)
        return allRecipes.find(r => r.id === dish?.recipeId)
    }

    const getIngredientDetails = (ingredientId: string): Ingredient | undefined => {
        return inventory.find(i => i.id === ingredientId)
    }

    const toggleDishAccordion = (dishId: string) => {
        setActiveDishId(prevId => (prevId === dishId ? null : dishId))
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-orange-50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-orange-200">
                    <h2 className="text-2xl font-semibold text-orange-700">Restaurant Menu</h2>
                    <button
                        onClick={onClose}
                        className="text-orange-500 hover:text-orange-700 transition-colors"
                        aria-label="Close menu modal"
                    >
                        <IconX size={28} />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-grow">
                    {menuItems.length === 0 && <p className="text-orange-600">No dishes available on the menu.</p>}
                    <ul className="space-y-3">
                        {menuItems.map(dish => {
                            const recipe = getRecipeForDish(dish.id)
                            const isAccordionOpen = activeDishId === dish.id

                            return (
                                <li key={dish.id} className="bg-white border border-orange-200 rounded-lg shadow-sm">
                                    <button
                                        onClick={() => toggleDishAccordion(dish.id)}
                                        className="w-full flex items-center justify-between p-3 text-left hover:bg-orange-100 focus:outline-none focus:bg-orange-100 transition-colors rounded-t-lg"
                                    >
                                        <div className="flex items-center">
                                            {dish.image && (
                                                <div className="mr-3 flex-shrink-0">
                                                    <Image
                                                        src={dish.image}
                                                        alt={dish.name}
                                                        width={60}
                                                        height={60}
                                                        className="rounded object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-medium text-orange-800">{dish.name}</h3>
                                                <p className="text-sm text-orange-600">${dish.basePrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        {recipe ? (isAccordionOpen ? <IconChevronUp size={24} className="text-orange-600" /> : <IconChevronDown size={24} className="text-orange-600" />) : null}
                                    </button>

                                    {isAccordionOpen && recipe && (
                                        <div className="p-3 border-t border-orange-200 bg-orange-50 rounded-b-lg">
                                            <h4 className="text-md font-semibold text-orange-700 mb-2">Recipe Steps:</h4>
                                            {recipe.cookingSteps.length === 0 && <p className="text-sm text-orange-500">No specific cooking steps listed for this recipe.</p>}
                                            <ul className="space-y-2">
                                                {recipe.cookingSteps.map((step, stepIndex) => (
                                                    <li key={stepIndex} className="p-2 bg-white border border-orange-100 rounded">
                                                        <div className="flex items-center text-orange-700 mb-1">
                                                            <IconToolsKitchen2 size={18} className="mr-1.5 text-orange-500" />
                                                            <span className="font-medium">Step {stepIndex + 1}: {step.type}</span>
                                                            <span className="text-xs text-gray-500 ml-2">({step.duration}s)</span>
                                                        </div>
                                                        {step.ingredientIds.length > 0 && (
                                                            <>
                                                                <p className="text-xs text-orange-600 mb-1 ml-1 flex items-center">
                                                                    <IconLeaf size={14} className="mr-1 text-green-500" />
                                                                    Ingredients for this step:
                                                                </p>
                                                                <div className="flex flex-wrap gap-2 ml-1">
                                                                    {step.ingredientIds.map(ingId => {
                                                                        const ingredient = getIngredientDetails(ingId)
                                                                        return ingredient ? (
                                                                            <div key={ingId} className="flex flex-col items-center p-1 bg-orange-100 rounded text-center max-w-[60px]">
                                                                                {ingredient.image && (
                                                                                    <Image
                                                                                        src={ingredient.image}
                                                                                        alt={ingredient.name}
                                                                                        width={32}
                                                                                        height={32}
                                                                                        className="rounded object-contain mb-0.5"
                                                                                    />
                                                                                )}
                                                                                <span className="text-3xs text-orange-700 truncate" title={ingredient.name}>{ingredient.name}</span>
                                                                            </div>
                                                                        ) : <span key={ingId} className="text-3xs text-red-500">Unknown Ing.</span>
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
} 
'use client'

import { useState, MouseEvent } from 'react'
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

    const scrollbarStyles = `
        .menu-modal-scroll-area::-webkit-scrollbar {
            width: 8px;
        }
        .menu-modal-scroll-area::-webkit-scrollbar-track {
            background-color: #CCFBF1; /* teal-100 */
        }
        .menu-modal-scroll-area::-webkit-scrollbar-thumb {
            background-color: #5EEAD4; /* teal-300 */
            border-radius: 4px;
        }
        .menu-modal-scroll-area::-webkit-scrollbar-thumb:hover {
            background-color: #2DD4BF; /* teal-400 */
        }
    `;

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

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <>
            <style>{scrollbarStyles}</style>
            <div
                className="fixed inset-0 flex items-center justify-center p-4 z-50"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                onClick={handleOverlayClick}
            >
                <div className="bg-teal-50 p-4 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b border-teal-200 pb-3 mb-3">
                        <h2 className="text-2xl font-semibold text-teal-700">Restaurant Menu</h2>
                        <button
                            onClick={onClose}
                            className="text-teal-500 hover:text-teal-700 transition-colors"
                            aria-label="Close menu modal"
                        >
                            <IconX size={28} />
                        </button>
                    </div>

                    <div className="menu-modal-scroll-area overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-teal-100 hover:scrollbar-thumb-teal-400">
                        {menuItems.length === 0 && <p className="text-teal-600">No dishes available on the menu.</p>}
                        <ul className="space-y-3">
                            {menuItems.map(dish => {
                                const recipe = getRecipeForDish(dish.id)
                                const isAccordionOpen = activeDishId === dish.id

                                return (
                                    <li key={dish.id} className="bg-white border border-teal-200 rounded-lg shadow-sm">
                                        <button
                                            onClick={() => toggleDishAccordion(dish.id)}
                                            className="w-full flex items-center justify-between p-3 text-left hover:bg-teal-100 focus:outline-none focus:bg-teal-100 transition-colors rounded-t-lg"
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
                                                    <h3 className="text-lg font-medium text-teal-800">{dish.name}</h3>
                                                    <p className="text-sm text-teal-600">${dish.basePrice.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            {recipe ? (isAccordionOpen ? <IconChevronUp size={24} className="text-teal-600" /> : <IconChevronDown size={24} className="text-teal-600" />) : null}
                                        </button>

                                        {isAccordionOpen && recipe && (
                                            <div className="p-3 border-t border-teal-200 bg-teal-50 rounded-b-lg">
                                                <h4 className="text-md font-semibold text-teal-700 mb-2">Recipe Steps:</h4>
                                                {recipe.cookingSteps.length === 0 && <p className="text-sm text-teal-500">No specific cooking steps listed for this recipe.</p>}
                                                <ul className="space-y-2">
                                                    {recipe.cookingSteps.map((step, stepIndex) => (
                                                        <li key={stepIndex} className="p-2 bg-white border border-teal-100 rounded">
                                                            <div className="flex items-center text-teal-700 mb-1">
                                                                <IconToolsKitchen2 size={18} className="mr-1.5 text-teal-500" />
                                                                <span className="font-medium">Step {stepIndex + 1}: {step.type}</span>
                                                                <span className="text-xs text-gray-500 ml-2">({step.duration}s)</span>
                                                            </div>
                                                            {step.ingredientIds.length > 0 && (
                                                                <>
                                                                    <p className="text-xs text-teal-600 mb-1 ml-1 flex items-center">
                                                                        <IconLeaf size={14} className="mr-1 text-green-500" />
                                                                        Ingredients for this step:
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2 ml-1">
                                                                        {step.ingredientIds.map(ingId => {
                                                                            const ingredient = getIngredientDetails(ingId)
                                                                            return ingredient ? (
                                                                                <div key={ingId} className="flex flex-col items-center p-1 bg-teal-100 rounded text-center max-w-[60px]">
                                                                                    {ingredient.image && (
                                                                                        <Image
                                                                                            src={ingredient.image}
                                                                                            alt={ingredient.name}
                                                                                            width={32}
                                                                                            height={32}
                                                                                            className="rounded object-contain mb-0.5"
                                                                                        />
                                                                                    )}
                                                                                    <span className="text-3xs text-teal-700 truncate" title={ingredient.name}>{ingredient.name}</span>
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
        </>
    )
} 
import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { Dish } from '@/types/models'

export function getAvailableMenu(): Dish[] {
    const diff = useGameStore.getState().game.difficulty
    const { menuItems, unlockedMenuItems } = useRestaurantStore.getState().restaurant
    return menuItems?.filter((d: Dish) => (d.unlockDifficulty ?? 1) <= diff && unlockedMenuItems.includes(d.id)) || []
}

export function unlockMenuItem(): Dish[] {
    const diff = useGameStore.getState().game.difficulty
    const restaurant = useRestaurantStore.getState().restaurant
    const newlyUnlocked: Dish[] = []

    restaurant.menuItems?.forEach((dish: Dish) => {
        if ((dish.unlockDifficulty ?? 1) <= diff && !restaurant.unlockedMenuItems.includes(dish.id)) {
            restaurant.unlockedMenuItems.push(dish.id)
            newlyUnlocked.push(dish)
        }
    })
    return newlyUnlocked
}

export function calculateDishComplexity(base: number): number {
    const diff = useGameStore.getState().game.difficulty
    return base + Math.floor(diff / 2)
} 
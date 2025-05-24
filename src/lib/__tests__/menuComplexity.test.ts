import { getAvailableMenu, unlockMenuItem, calculateDishComplexity } from '@/lib/menuComplexity'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@/state/game/gameStore', () => {
    const mockState = {
        game: {
            difficulty: 1,
        },
        actions: {},
    }
    return {
        useGameStore: {
            getState: jest.fn(() => mockState),
        },
    }
})

jest.mock('@/state/game/restaurantStore', () => {
    const mockRestaurant = {
        menuItems: [
            { id: 'dish_1', name: 'Salad', complexity: 1, unlockDifficulty: 1 },
            { id: 'dish_2', name: 'Burger', complexity: 2, unlockDifficulty: 2 },
            { id: 'dish_3', name: 'Pasta', complexity: 3, unlockDifficulty: 4 },
        ],
        unlockedMenuItems: ['dish_1'],
    }
    const mockState = {
        restaurant: mockRestaurant,
        actions: {},
    }
    return {
        useRestaurantStore: {
            getState: jest.fn(() => mockState),
        },
    }
})

import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'

// ---------------------------------------------------------------------------
const store = useGameStore.getState()
const restaurantState = useRestaurantStore.getState().restaurant

// ---------------------------------------------------------------------------
describe('Menu Complexity System', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // reset difficulty and unlocks
        store.game.difficulty = 1
        restaurantState.unlockedMenuItems = ['dish_1']
    })

    describe('getAvailableMenu', () => {
        it('returns dishes unlocked and within difficulty', () => {
            store.game.difficulty = 1
            let menu = getAvailableMenu()
            expect(menu.map((d) => d.id)).toEqual(['dish_1'])

            // increase difficulty to 2 – dish_2 still locked (not unlocked yet)
            store.game.difficulty = 2
            menu = getAvailableMenu()
            expect(menu.map((d) => d.id)).toEqual(['dish_1'])

            // Simulate dish_2 unlocked
            restaurantState.unlockedMenuItems.push('dish_2')
            menu = getAvailableMenu()
            expect(menu.map((d) => d.id)).toEqual(expect.arrayContaining(['dish_1', 'dish_2']))
        })
    })

    describe('unlockMenuItem', () => {
        it('unlocks new menu items when difficulty threshold reached', () => {
            // At diff 2 should unlock dish_2
            store.game.difficulty = 2
            let unlocked = unlockMenuItem()
            expect(unlocked.map((d) => d.id)).toEqual(['dish_2'])
            expect(restaurantState.unlockedMenuItems).toContain('dish_2')

            // At diff 4 should unlock dish_3 as well
            store.game.difficulty = 4
            unlocked = unlockMenuItem()
            expect(unlocked.map((d) => d.id)).toEqual(['dish_3'])
            expect(restaurantState.unlockedMenuItems).toContain('dish_3')

            // Calling again should not unlock duplicates
            const repeat = unlockMenuItem()
            expect(repeat).toHaveLength(0)
        })
    })

    describe('calculateDishComplexity', () => {
        it('scales complexity with difficulty (floor of diff/2)', () => {
            const base = 2 // base complexity
            store.game.difficulty = 1
            expect(calculateDishComplexity(base)).toBe(base)

            store.game.difficulty = 5 // floor(5/2)=2
            expect(calculateDishComplexity(base)).toBe(base + 2)

            store.game.difficulty = 10 // floor(10/2)=5
            expect(calculateDishComplexity(base)).toBe(base + 5)
        })
    })
}) 
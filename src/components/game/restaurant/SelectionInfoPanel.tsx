'use client'

import { GameSelection } from '../RestaurantView'
import { useRestaurantStore } from '@/state/game/restaurantStore';
import { useGameStore } from '@/state/game/gameStore';
import { Customer, Dish, Order } from '@/types/models';
import { calculateMaxOrderableDifficulty } from '@/lib/gameLoop';
import { Button } from '@mantine/core'; // Assuming Mantine UI is used

interface SelectionInfoPanelProps {
    selection: GameSelection;
    onClose: () => void;
}

export default function SelectionInfoPanel({
    selection,
    onClose
}: SelectionInfoPanelProps) {
    const { restaurant, actions: restaurantActions } = useRestaurantStore();
    const { game } = useGameStore();

    if (!selection.type || !selection.id) {
        return null;
    }

    let customerForOrder: Customer | undefined = undefined;
    let tableIdForOrder: string | undefined = undefined;

    if (selection.type === 'customer' && selection.data?.tableId) {
        customerForOrder = restaurant.activeCustomers.find(c => c.id === selection.id && c.tableId === selection.data?.tableId);
        tableIdForOrder = selection.data.tableId;
    } else if (selection.type === 'table') {
        customerForOrder = restaurant.activeCustomers.find(c => c.tableId === selection.id);
        tableIdForOrder = selection.id;
    }

    const canTakeOrder = customerForOrder && customerForOrder.status === 'seated' && !customerForOrder.order;
    let availableDishes: Dish[] = [];
    if (canTakeOrder && restaurant.menuItems) {
        const maxDifficulty = calculateMaxOrderableDifficulty(game.difficulty);
        availableDishes = restaurant.menuItems.filter(dish => dish.cookingDifficulty <= maxDifficulty);
    }

    const handleRandomOrder = () => {
        if (tableIdForOrder && availableDishes.length > 0) {
            const randomDish = availableDishes[Math.floor(Math.random() * availableDishes.length)];
            const result = restaurantActions.takeOrder(tableIdForOrder, randomDish.id);
            if (result.success) {
                console.log(`Order placed: ${result.order?.id} for dish ${randomDish.id} for customer ${customerForOrder?.name}`);
                onClose();
            } else {
                console.error(`Failed to take order for ${customerForOrder?.name}: ${result.message}`);
            }
        }
    };

    return (
        <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-blue-500 z-30 max-w-xs w-60">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm capitalize">{selection.type} Selected</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                >
                    ✕
                </button>
            </div>

            {selection.data && !(selection.type === 'customer' && canTakeOrder) && (
                <pre className="text-xs mt-1 bg-gray-100 p-1 rounded max-w-full overflow-auto mb-2">
                    {JSON.stringify(selection.data, null, 2)}
                </pre>
            )}

            {canTakeOrder && customerForOrder && (
                <div className="mt-1 pt-1 border-t">
                    <h4 className="font-semibold text-lg text-center my-2">{customerForOrder.name}</h4>
                    {availableDishes.length > 0 ? (
                        <Button
                            variant="filled"
                            size="sm"
                            fullWidth
                            onClick={handleRandomOrder}
                        >
                            Take Order
                        </Button>
                    ) : (
                        <p className="text-xs text-gray-500 mt-2 text-center">No dishes available for current game difficulty to assign.</p>
                    )}
                </div>
            )}
        </div>
    );
} 
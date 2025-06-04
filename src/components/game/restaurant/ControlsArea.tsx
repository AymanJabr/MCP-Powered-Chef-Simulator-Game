'use client'

import { useState } from 'react'
import { IconToolsKitchen2, IconShoppingCart, IconListDetails } from '@tabler/icons-react'
import InventoryPanel from '@/components/game/InventoryPanel'
import MenuModal from './MenuModal'

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ControlsAreaProps {
    onOpenInventory: () => void;
    onOpenRecipeBook?: () => void;
    onOpenShop?: () => void;
    kitchenAreaStyle: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    controlsAreaStyle: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export default function ControlsArea({
    onOpenInventory,
    onOpenRecipeBook,
    onOpenShop,
    kitchenAreaStyle,
    controlsAreaStyle
}: ControlsAreaProps) {
    const [isInventoryOpen, setIsInventoryOpen] = useState(false)
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)

    const toggleInventory = () => {
        setIsInventoryOpen(!isInventoryOpen)
        if (!isInventoryOpen) {
            onOpenInventory()
        }
    }

    const toggleMenuModal = () => {
        setIsMenuModalOpen(!isMenuModalOpen)
    }

    return (
        <>
            <div
                className="absolute bg-slate-100 border-t-2 border-slate-300"
                style={{
                    left: `${controlsAreaStyle.x}%`,
                    top: `${controlsAreaStyle.y}%`,
                    width: `${controlsAreaStyle.width}%`,
                    height: `${controlsAreaStyle.height}%`,
                    zIndex: 40
                }}
            >
                <div className="p-2 flex items-center justify-center h-full">
                    <h2 className="text-lg font-semibold text-orange-700 mb-3 sticky top-0 bg-orange-50 py-2 z-10">Game Controls</h2>
                    <div className="space-y-2">
                        <button
                            onClick={toggleInventory}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                        >
                            <IconShoppingCart size={20} className="mr-2" />
                            Manage Inventory
                        </button>

                        <button
                            onClick={toggleMenuModal}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50"
                        >
                            <IconListDetails size={20} className="mr-2" />
                            View Menu
                        </button>
                    </div>
                </div>
            </div>

            {isInventoryOpen && (
                <InventoryPanel
                    isOpen={isInventoryOpen}
                    onClose={toggleInventory}
                />
            )}

            <MenuModal
                isOpen={isMenuModalOpen}
                onClose={toggleMenuModal}
            />
        </>
    )
} 
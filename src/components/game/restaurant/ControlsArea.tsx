'use client'

import { useState } from 'react'
import { IconShoppingCart, IconBook, IconToolsKitchen2, IconListDetails } from '@tabler/icons-react'
import MenuModal from './MenuModal'
import { Order } from '@/types/models'

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ControlsAreaProps {
    onOpenInventory: () => void;
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
    onOpenManageDishesModal: () => void;
}

export default function ControlsArea({
    onOpenInventory,
    kitchenAreaStyle,
    controlsAreaStyle,
    onOpenManageDishesModal
}: ControlsAreaProps) {
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)

    const toggleMenuModal = () => {
        setIsMenuModalOpen(!isMenuModalOpen)
    }

    const handleManageDishesClick = () => {
        onOpenManageDishesModal();
    };

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
                <div className="p-3 h-full flex items-center justify-center space-x-3">
                    <button
                        onClick={toggleMenuModal}
                        className="flex items-center justify-center px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 min-w-[180px]"
                    >
                        <IconBook size={20} className="mr-2" />
                        View Menu
                    </button>

                    <button
                        onClick={onOpenInventory}
                        className="flex items-center justify-center px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 min-w-[180px]"
                    >
                        <IconShoppingCart size={20} className="mr-2" />
                        Manage Inventory
                    </button>

                    <button
                        onClick={handleManageDishesClick}
                        className="flex items-center justify-center px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 min-w-[180px]"
                        title="Manage active dishes and kitchen tasks"
                    >
                        <IconListDetails size={20} className="mr-2" />
                        Manage Dishes
                    </button>
                </div>
            </div>

            <MenuModal
                isOpen={isMenuModalOpen}
                onClose={toggleMenuModal}
            />
        </>
    )
} 
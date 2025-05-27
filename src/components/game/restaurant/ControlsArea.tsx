'use client'

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ControlsAreaProps {
    onManageInventoryClick: () => void;
    areaStyle: AreaStyle;
}

export default function ControlsArea({
    onManageInventoryClick,
    areaStyle
}: ControlsAreaProps) {
    return (
        <div
            className="absolute bg-slate-100 border-t-2 border-slate-300"
            style={{
                left: `${areaStyle.x}%`,
                top: `${areaStyle.y}%`,
                width: `${areaStyle.width}%`,
                height: `${areaStyle.height}%`,
                zIndex: 40 // Keep zIndex as it was in the original
            }}
        >
            <div className="p-2 flex items-center justify-center h-full">
                <button
                    className="px-4 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
                    onClick={onManageInventoryClick}
                >
                    Manage Inventory
                </button>
            </div>
        </div>
    );
} 
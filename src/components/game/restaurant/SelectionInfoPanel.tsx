'use client'

import { GameSelection } from '../RestaurantView' // Assuming GameSelection is exported

interface SelectionInfoPanelProps {
    selection: GameSelection;
    onClose: () => void;
}

export default function SelectionInfoPanel({
    selection,
    onClose
}: SelectionInfoPanelProps) {
    if (!selection.type || !selection.id) {
        return null;
    }

    return (
        <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg p-3 border-2 border-blue-500 z-30 max-w-xs">
            <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-sm capitalize">{selection.type} Selected</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                >
                    ✕
                </button>
            </div>
            <div className="text-xs text-gray-600">
                ID: <span className="font-mono">{selection.id}</span>
            </div>
            {selection.data && (
                <pre className="text-xs mt-1 bg-gray-100 p-1 rounded max-w-full overflow-auto">
                    {JSON.stringify(selection.data, null, 2)}
                </pre>
            )}
        </div>
    );
} 
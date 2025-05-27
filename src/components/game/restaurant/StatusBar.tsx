'use client'

import { useGameStore } from '@/state/game/gameStore'
import { useRestaurantStore } from '@/state/game/restaurantStore'
import { formatTime, formatCurrency, renderStars } from '@/utils/formatters'

interface AreaStyle {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Props for StatusBar component
interface StatusBarProps {
    funds: number;
    timeElapsed: number;
    customerQueueLength: number;
    customerCapacity: number;
    reputation: number;
    gameMode: 'mcp' | 'manual';
    areaStyle: AreaStyle;
}

export default function StatusBar({
    funds,
    timeElapsed,
    customerQueueLength,
    customerCapacity,
    reputation,
    gameMode,
    areaStyle
}: StatusBarProps) {
    return (
        <div
            className="absolute bg-slate-800 text-white px-4 flex items-center justify-between text-xs"
            style={{
                left: `${areaStyle.x}%`,
                top: `${areaStyle.y}%`,
                width: `${areaStyle.width}%`,
                height: `${areaStyle.height}%`
            }}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <span className="text-green-400">💰</span>
                    <span className="font-semibold">{formatCurrency(funds)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⏰</span>
                    <span>{formatTime(timeElapsed)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-blue-400">👥</span>
                    <span>{customerQueueLength}/{customerCapacity}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span>{renderStars(reputation)}</span>
                    <span className="text-xs text-gray-300">({reputation.toFixed(1)})</span>
                </div>
            </div>
            <div className="font-semibold">
                Game Mode: {gameMode === 'mcp' ? 'MCP-Chef' : 'Human-Chef'}
            </div>
        </div>
    )
} 
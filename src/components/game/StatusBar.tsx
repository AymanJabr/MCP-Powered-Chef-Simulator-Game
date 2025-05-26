'use client'

interface StatusBarProps {
    funds: number
    reputation: number
    queueLength: number
    capacity: number
    timeElapsed: number
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, '0')}`
}

function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`
}

function renderStars(rating: number): string {
    const maxStars = 5
    // Clamp rating between 0 and maxStars to prevent negative values or excessive ratings
    const clampedRating = Math.max(0, Math.min(maxStars, rating))
    const fullStars = Math.floor(clampedRating)
    const hasHalfStar = (clampedRating % 1) >= 0.5

    let stars = '★'.repeat(fullStars)
    if (hasHalfStar) stars += '☆'
    const remainingStars = maxStars - Math.ceil(clampedRating)
    stars += '☆'.repeat(remainingStars)

    return stars
}

export default function StatusBar({
    funds,
    reputation,
    queueLength,
    capacity,
    timeElapsed
}: StatusBarProps) {
    return (
        <div className="bg-slate-800 text-white px-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-green-400 font-mono text-lg">💰</span>
                    <span className="font-semibold">{formatCurrency(funds)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⏰</span>
                    <span className="font-mono">{formatTime(timeElapsed)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-blue-400">👥</span>
                    <span>Queue: {queueLength}/{capacity}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-yellow-400">⭐</span>
                    <span>Reputation: {renderStars(reputation)}</span>
                    <span className="text-sm text-gray-300">({reputation.toFixed(1)})</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-300">
                    Chef Simulator
                </div>
            </div>
        </div>
    )
} 
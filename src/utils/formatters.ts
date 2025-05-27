export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, '0')}`
}

export const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`
}

export const renderStars = (rating: number): string => {
    const maxStars = 5
    const clampedRating = Math.max(0, Math.min(maxStars, rating))
    const fullStars = Math.floor(clampedRating)
    const hasHalfStar = (clampedRating % 1) >= 0.5

    let stars = '★'.repeat(fullStars)
    if (hasHalfStar) stars += '☆' // Using a different character for half-star or empty part of star
    const remainingStars = maxStars - Math.ceil(clampedRating)
    stars += '☆'.repeat(remainingStars) // Using a different character for empty stars

    return stars
} 
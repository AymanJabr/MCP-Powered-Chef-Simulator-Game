const imageCache: Record<string, HTMLImageElement> = {}

export function preloadImages(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => {
        return new Promise<void>((resolve, reject) => {
            if (imageCache[url]) {
                resolve()
                return
            }

            const img = new Image()
            img.onload = () => {
                imageCache[url] = img
                resolve()
            }
            img.onerror = reject
            img.src = url
        })
    })

    return Promise.all(promises)
}

export function preloadCriticalAssets(): Promise<void[]> {
    const criticalImages = [
        // UI elements - selected a couple based on your plan and common UI elements
        '/assets/images/misc/floating_icons/clock_icon_blank.png', // Changed from non-existent /ui/ path
        '/assets/images/misc/plate.png', // A common game element

        // Common ingredients - selected a couple from your project structure
        '/assets/images/ingredients/meat_steak.png',
        '/assets/images/ingredients/tomato.png',

        // Equipment - selected one from your project structure
        '/assets/images/equipment/oven.png',

        // A character sprite
        '/assets/images/characters/chef_1/idle_down_01.png',
    ]

    return preloadImages(criticalImages)
} 
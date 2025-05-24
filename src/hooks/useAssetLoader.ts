import { useState, useEffect } from 'react'
import { preloadImages } from '@/lib/assetLoader'

export function useAssetLoader(urls: string[]) {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        // Ensure urls is always an array of images, we will see later if we need to support other types of assets
        const currentUrls = Array.isArray(urls) ? urls : [];
        if (currentUrls.length === 0) {
            setLoaded(true);
            setError(null);
            return;
        }

        setLoaded(false)
        setError(null)

        let isCancelled = false;

        preloadImages(currentUrls)
            .then(() => {
                if (!isCancelled) {
                    setLoaded(true)
                }
            })
            .catch(err => {
                if (!isCancelled) {
                    setError(err)
                }
            })

        return () => {
            isCancelled = true;
        }
    }, [urls]) // Depend only on the stringified urls of the images for now

    return { loaded, error }
} 
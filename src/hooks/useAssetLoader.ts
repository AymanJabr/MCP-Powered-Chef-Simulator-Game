import { useState, useEffect } from 'react'
import { preloadImages } from '@/lib/assetLoader'

export function useAssetLoader(urls: string[], dependencies: any[] = []) {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        // Ensure urls is always an array, even if dependencies change it to something else momentarily
        const currentUrls = Array.isArray(urls) ? urls : [];
        if (currentUrls.length === 0) {
            setLoaded(true); // If no URLs, consider it loaded
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, JSON.stringify(urls)]) // Add urls to dependency array, stringified to handle array changes

    return { loaded, error }
} 
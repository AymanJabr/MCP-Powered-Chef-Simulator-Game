import { renderHook, act, waitFor } from '@testing-library/react'
import { useAssetLoader } from '../useAssetLoader'
import { preloadImages } from '@/lib/assetLoader'
import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock the assetLoader module first
jest.mock('@/lib/assetLoader', () => ({
    preloadImages: jest.fn().mockImplementation(() => Promise.resolve([]))
}))

// We need to mock the hook module separately for the component tests
jest.mock('../useAssetLoader', () => {
    // Keep a reference to the original module
    const originalModule = jest.requireActual('../useAssetLoader');

    // For the hook tests, we want to use the actual implementation
    // For component tests, we'll override this
    return {
        __esModule: true, // Needed for ES modules
        useAssetLoader: jest.fn().mockImplementation(originalModule.useAssetLoader)
    };
});

describe('useAssetLoader Hook', () => {
    beforeEach(() => {
        // Reset mocks and setup default value
        jest.clearAllMocks();
        (preloadImages as jest.Mock).mockImplementation(() => Promise.resolve([]));
    });

    it('should start with loaded=false and no error for non-empty URLs', () => {
        // Return a pending promise
        (preloadImages as jest.Mock).mockReturnValue(new Promise(() => { }));

        // Render the hook with the real implementation
        const { result } = renderHook(() => useAssetLoader(['/test.png']));

        // Check initial state
        expect(result.current.loaded).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should start with loaded=true for empty URLs array', () => {
        const { result } = renderHook(() => useAssetLoader([]));
        expect(result.current.loaded).toBe(true);
        expect(result.current.error).toBe(null);
        expect(preloadImages).not.toHaveBeenCalled();
    });

    it('should set loaded=true when assets are loaded successfully', async () => {
        // Make sure preloadImages resolves immediately
        (preloadImages as jest.Mock).mockResolvedValue([]);

        // Render the hook with URLs to load
        const { result } = renderHook(() => useAssetLoader(['/test1.png', '/test2.png']));

        // Initial state should be loading
        expect(result.current.loaded).toBe(false);

        // Wait for the effect to run and state to update
        await waitFor(() => expect(result.current.loaded).toBe(true));

        // Check loaded state (already confirmed by waitFor, but good for clarity)
        expect(result.current.loaded).toBe(true);
        expect(result.current.error).toBe(null);

        // Verify preloadImages was called with correct URLs
        expect(preloadImages).toHaveBeenCalledWith(['/test1.png', '/test2.png']);
    });

    it('should set error state when asset loading fails', async () => {
        // Make preloadImages reject
        const testError = new Error('Failed to load assets');
        (preloadImages as jest.Mock).mockRejectedValue(testError);

        // Render the hook
        const { result } = renderHook(() => useAssetLoader(['/error.png']));

        // Wait for effect to run and state to update
        await waitFor(() => expect(result.current.error).toBe(testError));

        // Check error state (already confirmed by waitFor, but good for clarity)
        expect(result.current.loaded).toBe(false);
        expect(result.current.error).toBe(testError);
    });

    it('should reload assets when urls array content changes', async () => {
        // Initially load a single URL
        const initialUrls = ['/test.png'];
        const { result, rerender } = renderHook(
            ({ urls }) => useAssetLoader(urls),
            { initialProps: { urls: initialUrls } }
        );

        // Wait for initial load
        await act(async () => {
            await Promise.resolve();
        });

        // Should be loaded
        expect(result.current.loaded).toBe(true);
        expect(preloadImages).toHaveBeenCalledWith(initialUrls);

        // Clear mock for next assertion
        (preloadImages as jest.Mock).mockClear();

        // Change the URLs to trigger reload
        const newUrls = ['/test.png', '/another.png'];
        rerender({ urls: newUrls });

        // Should reset to loading state
        expect(result.current.loaded).toBe(false);

        // Wait for second load
        await act(async () => {
            await Promise.resolve();
        });

        // Should be loaded with new URLs
        expect(result.current.loaded).toBe(true);
        expect(preloadImages).toHaveBeenCalledWith(newUrls);
    });

    it('should cancel pending loads when unmounted', async () => {
        // Create a promise that we can manually control
        let resolvePromise: (value: unknown) => void;
        const controlledPromise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        // Make preloadImages return our controlled promise
        (preloadImages as jest.Mock).mockReturnValue(controlledPromise);

        // Render the hook
        const { result, unmount } = renderHook(() => useAssetLoader(['/test.png']));

        // Should start in loading state
        expect(result.current.loaded).toBe(false);

        // Unmount the component
        unmount();

        // Now resolve the promise after unmount
        await act(async () => {
            resolvePromise([]); // Resolve with empty result
            await Promise.resolve(); // Let any effects run
        });

        // State should not have changed (still false)
        expect(result.current.loaded).toBe(false);
    });
});

// Sample component that uses the asset loader
const AssetLoadingExample = ({ assetUrls }: { assetUrls: string[] }) => {
    const { loaded, error } = useAssetLoader(assetUrls);

    if (error) return <div>Error loading assets: {error.message}</div>;
    if (!loaded) return <div>Loading assets...</div>;

    return <div>Assets loaded successfully!</div>;
};

// Separate describe block for component tests
describe('Components using Asset Loading', () => {
    beforeEach(() => {
        // Override the hook mock for component tests
        (useAssetLoader as jest.Mock).mockImplementation(
            // Return different test values for each test
            () => ({ loaded: false, error: null })
        );
    });

    it('should show loading state while assets are loading', () => {
        // Keep the mock returning loading state
        render(<AssetLoadingExample assetUrls={['/test.png']} />);
        expect(screen.getByText('Loading assets...')).toBeInTheDocument();
    });

    it('should show success state when assets are loaded', () => {
        // Override with loaded state for this test
        (useAssetLoader as jest.Mock).mockReturnValue({
            loaded: true,
            error: null
        });

        render(<AssetLoadingExample assetUrls={['/test.png']} />);
        expect(screen.getByText('Assets loaded successfully!')).toBeInTheDocument();
    });

    it('should show error state when asset loading fails', () => {
        // Override with error state for this test
        (useAssetLoader as jest.Mock).mockReturnValue({
            loaded: false,
            error: new Error('Failed to load')
        });

        render(<AssetLoadingExample assetUrls={['/test.png']} />);
        expect(screen.getByText('Error loading assets: Failed to load')).toBeInTheDocument();
    });
}); 
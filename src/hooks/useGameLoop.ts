import { useEffect } from 'react';
import { useKitchenStore } from '@/state/game/kitchenStore';

const useGameLoop = () => {
    const { activeCookingProcesses, actions: kitchenActions } = useKitchenStore();

    useEffect(() => {
        const gameTick = setInterval(() => {
            // Update all active cooking processes
            activeCookingProcesses.forEach(process => {
                if (process.status !== 'in_progress') return;

                const elapsedTime = Date.now() - process.startTime;
                const newProgress = (elapsedTime / process.optimalCookingTime) * 100;

                if (newProgress >= 100) {
                    // TODO: Quality score calculation can be added here
                    const qualityScore = 100;
                    kitchenActions.finishCookingProcess(process.id, qualityScore);
                } else {
                    kitchenActions.updateCookingProgress(process.id, newProgress, false);
                }
            });
        }, 1000); // Runs every second

        return () => clearInterval(gameTick);
    }, [activeCookingProcesses, kitchenActions]);
};

export default useGameLoop; 
import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/state/game/gameStore';
import { useRestaurantStore } from '@/state/game/restaurantStore';
import { startGameLoop, stopGameLoop, isGameLoopRunning } from '@/lib/gameLoop';
import MainMenu from './game/MainMenu';
import GameOverScreen from './game/GameOverScreen';
import RestaurantView from './game/RestaurantView';
// import PerformanceMetrics from './game/PerformanceMetrics'; // Removed
// import MCPInterface from './mcp/MCPInterface';
// import { preloadCriticalAssets } from '@/lib/assetLoader'; // Assuming assetLoader.ts exists
import { LoadingOverlay } from '@mantine/core';

const GameClient = () => {
    const gamePhase = useGameStore(state => state.game.gamePhase);
    // const gameMode = useGameStore(state => state.game.gameMode);
    // const gamePerformanceMetrics = useGameStore(state => state.game.performanceMetrics);
    const isPaused = useGameStore(state => state.game.isPaused);
    const initializeInventory = useRestaurantStore(state => state.actions.initializeInventory);
    const initializeFullMenu = useRestaurantStore(state => state.actions.initializeFullMenu);

    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        // Initialize inventory and then simulate asset loading
        Promise.all([initializeInventory(), initializeFullMenu()]).then(() => {
            // For now, simulate asset loading delay after inventory is initialized
            setTimeout(() => {
                setAssetsLoaded(true);
                setShowLoading(false);
            }, 100); // Simulate a short load time
        });
    }, [initializeInventory, initializeFullMenu]);

    useEffect(() => {
        if (gamePhase === 'active' && !isPaused && !isGameLoopRunning()) {
            startGameLoop();
        } else if ((gamePhase === 'gameOver' || gamePhase === 'preGame' || isPaused) && isGameLoopRunning()) {
            stopGameLoop();
        }
        // Cleanup function to stop loop if component unmounts while active
        return () => {
            if (isGameLoopRunning()) {
                stopGameLoop();
            }
        };
    }, [gamePhase, isPaused]);

    if (showLoading || !assetsLoaded) {
        return <LoadingOverlay visible={true} />;
    }

    if (gamePhase === 'preGame') {
        return <MainMenu />;
    }

    if (gamePhase === 'gameOver') {
        return <GameOverScreen />;
    }

    if (gamePhase === 'active') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* TODO: Add a proper game header with Pause button, score, etc. */}
                {/* <Button onClick={togglePause}>{isPaused ? 'Resume' : 'Pause'}</Button> */}
                <div style={{ flexGrow: 1 /* placeholder for actual layout */ }}>
                    <RestaurantView />
                    {/* Sidebar removed, only MCPInterface might be needed conditionally or elsewhere */}
                    {/* {gameMode === 'mcp' && <MCPInterface />} */}
                </div>
            </div>
        );
    }

    // Fallback or other phases like 'tutorial'
    return <div>Loading Game... Current Phase: {gamePhase}</div>;
};

export default GameClient; 
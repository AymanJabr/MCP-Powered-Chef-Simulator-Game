import React from 'react';
import { Button, Stack, Title, Text } from '@mantine/core';
import { useGameStore } from '@/state/game/gameStore';
import { useRestaurantStore } from '@/state/game/restaurantStore';
import { resetCustomersLeftCounter } from '@/lib/gameLoop'; // Assuming this function exists and is exported

const GameOverScreen = () => {
    const { resetGame } = useGameStore(state => state.actions);
    const { resetRestaurantState } = useRestaurantStore(state => state.actions);
    const game = useGameStore(state => state.game); // For displaying score or reason

    // TODO: Get actual game over reason and score from game state or event payload
    const reason = "(Placeholder: Reason for game over)";
    const score = game.performanceMetrics.financialPerformance; // Example score

    const handlePlayAgain = () => {
        resetCustomersLeftCounter(); // Reset counter in gameLoop
        resetGame(); // Resets game phase to preGame and other relevant states
        resetRestaurantState(); // Call the new reset action
    };

    return (
        <Stack align="center" justify="center" style={{ height: '100vh' }}>
            <Title order={1}>Game Over</Title>
            <Text>Reason: {reason}</Text>
            <Text>Final Score: {score}</Text>
            <Button onClick={handlePlayAgain} variant="filled" size="lg" mt="md">
                Play Again
            </Button>
        </Stack>
    );
};

export default GameOverScreen; 
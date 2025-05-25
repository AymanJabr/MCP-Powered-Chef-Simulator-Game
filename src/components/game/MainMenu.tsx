import React, { useState } from 'react';
import { Button, Stack, Title, Text } from '@mantine/core';
import { useGameStore } from '@/state/game/gameStore';
import ApiKeyConfigScreen from '../config/ApiKeyConfigScreen';
import { LLMProvider } from '@/types/models';

const MainMenu = () => {
    const { setGameMode, setGamePhase, setDifficulty } = useGameStore(state => state.actions);
    const [showMCPConfigScreen, setShowMCPConfigScreen] = useState(false);

    const handleStartManualGame = () => {
        setGameMode('manual');
        setDifficulty(1);
        setGamePhase('active');
    };

    const handleShowMCPConfig = () => {
        setShowMCPConfigScreen(true);
    };

    const handleMCPConfigComplete = (settings: LLMProvider) => {
        // TODO: Persist LLMProvider settings more robustly (e.g., in gameStore or a new mcpStore)
        // For now, we can assume useGameStore might get an action to set these if needed.
        // Example: if (actions.setLlmSettings) actions.setLlmSettings(settings);
        console.log("MCP LLM Settings chosen:", settings); // Log for now

        setGameMode('mcp');
        setDifficulty(1);
        setGamePhase('active');
    };

    if (showMCPConfigScreen) {
        return <ApiKeyConfigScreen onConfigComplete={handleMCPConfigComplete} />;
    }

    return (
        <Stack align="center" justify="center" style={{ height: '100vh' }} gap="xl">
            <Title order={1} mb="xl">MCP Powered Chef Simulator</Title>

            <Stack align="center" gap="xs">
                <Button
                    onClick={handleStartManualGame}
                    variant="outline"
                    size="lg"
                    style={{ minWidth: '350px' }}
                >
                    I am a strong independent human (Manual Mode)
                </Button>
                <Text size="xs" c="dimmed">
                    Recommended for first-time players
                </Text>
            </Stack>

            <Button
                onClick={handleShowMCPConfig}
                variant="filled"
                size="lg"
                style={{ minWidth: '350px' }}
            >
                Use the MCP-power armor (MCP Mode)
            </Button>
            {/* TODO: Add tutorial button, options, etc. */}
        </Stack>
    );
};

export default MainMenu; 
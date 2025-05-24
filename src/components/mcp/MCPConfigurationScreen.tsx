import React, { useState } from 'react';
import { Stack, Title, Select, TextInput, Button } from '@mantine/core';
// import { useGameStore } from '@/state/game/gameStore'; // Not using game store action directly here for now
import { LLMProvider } from '@/types/models';

interface MCPConfigurationScreenProps {
    onConfigureComplete: (settings: LLMProvider) => void;
}

// Placeholder data
const availableProviders: LLMProvider['name'][] = ['claude', 'gpt', 'gemini', 'mock'];
const modelsByProvider: Record<LLMProvider['name'], string[]> = {
    claude: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    gpt: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    gemini: ['gemini-1.5-pro-latest', 'gemini-1.0-pro'],
    mock: ['mock-fast', 'mock-slow'],
};

const MCPConfigurationScreen = ({ onConfigureComplete }: MCPConfigurationScreenProps) => {
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider['name'] | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    // const { setLlmProvider } = useGameStore(state => state.actions); // Removed for now

    const handleStart = () => {
        if (selectedProvider && selectedModel) {
            const providerSettings: LLMProvider = {
                name: selectedProvider,
                model: selectedModel,
                apiKey: apiKey || undefined,
                temperature: 0.7,
                maxTokens: 1024,
            };
            // setLlmProvider(providerSettings); // Removed for now
            onConfigureComplete(providerSettings);
        }
    };

    return (
        <Stack align="center" justify="center" style={{ height: '100vh' }} gap="md" p="md">
            <Title order={2} mb="lg">Configure MCP Assistant</Title>

            <Select
                label="Select LLM Provider"
                placeholder="Choose a provider"
                data={availableProviders.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                value={selectedProvider}
                onChange={(value) => {
                    setSelectedProvider(value as LLMProvider['name'] | null);
                    setSelectedModel(null);
                }}
                style={{ width: '300px' }}
                required
            />

            {selectedProvider && selectedProvider !== 'mock' && (
                <TextInput
                    label="API Key"
                    placeholder={`Your ${selectedProvider} API Key`}
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.currentTarget.value)}
                    style={{ width: '300px' }}
                    required
                />
            )}

            {selectedProvider && (
                <Select
                    label="Select Model"
                    placeholder="Choose a model"
                    data={modelsByProvider[selectedProvider]?.map(m => ({ value: m, label: m })) || []}
                    value={selectedModel}
                    onChange={(value) => setSelectedModel(value as string | null)}
                    disabled={!selectedProvider || !modelsByProvider[selectedProvider]?.length}
                    style={{ width: '300px' }}
                    required
                />
            )}

            <Button
                onClick={handleStart}
                disabled={!selectedProvider || !selectedModel || (selectedProvider !== 'mock' && !apiKey)}
                mt="lg"
                size="md"
            >
                Start Game with MCP
            </Button>
        </Stack>
    );
};

export default MCPConfigurationScreen; 
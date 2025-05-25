'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Stack,
    Title,
    Radio,
    TextInput,
    PasswordInput,
    Select,
    Button,
    Group,
    Text,
    Alert,
    Loader,
    Paper, // For a container similar to the card in the example
} from '@mantine/core';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { LLMProvider, ModelInfo, SupportedProvider } from '@/types/models';
import {
    storeApiKey,
    getApiKey,
    storeLastProvider,
    storeLastModel,
    getLastProvider,
    getLastModel,
    clearStoredLLMSettings,
} from '@/lib/llmConfigUtils';

interface ApiKeyConfigScreenProps {
    onConfigComplete: (config: LLMProvider) => void;
}

const availableProviders: SupportedProvider[] = ['openai', 'anthropic', 'gemini'];

export default function ApiKeyConfigScreen({
    onConfigComplete,
}: ApiKeyConfigScreenProps) {
    const [provider, setProvider] = useState<SupportedProvider>('openai');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [models, setModels] = useState<ModelInfo[]>([]);

    const fetchModels = useCallback(
        async (providerName: SupportedProvider, currentApiKey: string) => {
            if (!currentApiKey) {
                setModels([]);
                setModel('');
                return;
            }
            setIsLoadingModels(true);
            setError(null);
            setModels([]);
            setModel('');
            try {
                const response = await fetch('/api/models', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: providerName,
                        apiKey: currentApiKey,
                    }),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || `Error fetching models: ${response.status}`);
                }
                if (data.error) throw new Error(data.error);
                const fetchedModels: ModelInfo[] = data.models || [];
                setModels(fetchedModels);
                if (fetchedModels.length > 0) {
                    const lastModel = getLastModel();
                    if (lastModel && fetchedModels.find((m: ModelInfo) => m.id === lastModel)) {
                        setModel(lastModel);
                    } else {
                        setModel(fetchedModels[0].id);
                    }
                } else {
                    setError('No models available for this API key or provider.');
                }
            } catch (err) {
                console.error('Error fetching models:', err);
                setError(err instanceof Error ? err.message : String(err));
                setModels([]);
                setModel('');
            } finally {
                setIsLoadingModels(false);
            }
        },
        []
    );

    useEffect(() => {
        const savedLastProvider = getLastProvider();
        const savedLastModel = getLastModel();
        let initialProvider: SupportedProvider = 'openai';
        if (savedLastProvider && availableProviders.includes(savedLastProvider)) {
            initialProvider = savedLastProvider;
        }
        setProvider(initialProvider);
        const savedApiKey = getApiKey(initialProvider);
        if (savedApiKey) {
            setApiKey(savedApiKey);
            fetchModels(initialProvider, savedApiKey).then(() => {
                setModels(prevModels => {
                    if (savedLastModel && prevModels.find((m: ModelInfo) => m.id === savedLastModel)) {
                        setModel(savedLastModel);
                    }
                    return prevModels;
                });
            });
        }
    }, [fetchModels]);

    const handleProviderChange = (newProvider: SupportedProvider) => {
        setProvider(newProvider);
        setApiKey(getApiKey(newProvider) || '');
        setModels([]);
        setModel('');
        setError(null);
        setSuccess(null);
        const currentApiKey = getApiKey(newProvider);
        if (currentApiKey) {
            fetchModels(newProvider, currentApiKey);
        }
    };

    const handleApiKeyChange = (value: string) => {
        setApiKey(value);
        if (!value) {
            setModels([]);
            setModel('');
        }
    };

    const handleApiKeyBlur = () => {
        if (apiKey) {
            fetchModels(provider, apiKey);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!apiKey) {
            setError(`Please enter an API key for ${provider}.`);
            return;
        }
        if (!model) {
            setError('Please select a model.');
            return;
        }
        storeApiKey(provider, apiKey);
        storeLastProvider(provider);
        storeLastModel(model);

        let llmName: LLMProvider['name'];
        switch (provider) {
            case 'openai': llmName = 'openai'; break;
            case 'anthropic': llmName = 'anthropic'; break;
            case 'gemini': llmName = 'gemini'; break;
            default:
                console.error("Unsupported provider selected in handleSubmit");
                llmName = 'openai';
        }

        const configToPass: LLMProvider = {
            name: llmName,
            model: model,
            apiKey: apiKey,
            temperature: 0.7,
            maxTokens: 1024,
        };
        onConfigComplete(configToPass);
        setSuccess('API configuration saved and game starting!');
    };

    const handleClearSettings = () => {
        clearStoredLLMSettings();
        setProvider('openai');
        setApiKey('');
        setModel('');
        setModels([]);
        setError(null);
        setSuccess('LLM settings cleared from session storage.');
        setTimeout(() => setSuccess(null), 3000);
    };

    return (
        <Stack align="center" justify="center" style={{ height: '100vh' }} p="md">
            <Paper shadow="sm" p="xl" radius="md" withBorder style={{ width: '100%', maxWidth: '500px' }}>
                <Title order={2} ta="center" mb="xl">Configure LLM Assistant</Title>
                <form onSubmit={handleSubmit}>
                    <Stack gap="lg">
                        <Radio.Group
                            name="llmProvider"
                            label="Select LLM Provider"
                            value={provider}
                            onChange={(value) => handleProviderChange(value as SupportedProvider)}
                            required
                        >
                            <Group mt="xs">
                                {availableProviders.map(p => (
                                    <Radio key={p} value={p} label={p.charAt(0).toUpperCase() + p.slice(1)} />
                                ))}
                            </Group>
                        </Radio.Group>

                        <PasswordInput
                            label={`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key`}
                            placeholder={`Enter your ${provider} API key`}
                            value={apiKey}
                            onChange={(event) => handleApiKeyChange(event.currentTarget.value)}
                            onBlur={handleApiKeyBlur}
                            required
                            description={<Text size="xs">Get your API key from the <a href={provider === 'openai' ? "https://platform.openai.com/api-keys" : provider === 'anthropic' ? "https://console.anthropic.com/settings/keys" : "https://aistudio.google.com/app/apikey"} target="_blank" rel="noopener noreferrer">official provider website</a>.</Text>}
                        />

                        <Select
                            label="Select Model"
                            placeholder={isLoadingModels ? "Loading models..." : models.length === 0 ? "Enter API key to see models" : "Select a model"}
                            data={models.map(m => ({ value: m.id, label: m.name }))}
                            value={model}
                            onChange={(value) => setModel(value || '')}
                            disabled={isLoadingModels || models.length === 0}
                            rightSection={isLoadingModels ? <Loader size="xs" /> : undefined}
                            searchable
                            required
                            description={<Text size="xs">Model capabilities and costs vary. Choose one appropriate for your needs.</Text>}
                        />

                        {error && (
                            <Alert title="Error" color="red" icon={<IconAlertCircle size={16} />} radius="xs">
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert title="Success" color="green" icon={<IconCircleCheck size={16} />} radius="xs">
                                {success}
                            </Alert>
                        )}

                        <Button type="submit" fullWidth mt="md" disabled={!model || !apiKey || isLoadingModels}>
                            Save Settings & Start Game
                        </Button>
                        <Button type="button" variant="default" fullWidth onClick={handleClearSettings} mt="sm">
                            Clear Saved Settings
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
} 
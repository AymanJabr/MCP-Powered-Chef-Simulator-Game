import { NextRequest, NextResponse } from 'next/server'
import { ModelInfo, SupportedProvider } from '@/types/models'

// Add POST endpoint for fetching models
export async function POST(req: NextRequest) {
    const { provider, apiKey } = await req.json()

    if (!provider) {
        return NextResponse.json(
            { error: 'Provider parameter is required (openai, anthropic, or gemini)' },
            { status: 400 }
        )
    }

    if (!apiKey) {
        return NextResponse.json({
            models: [],
            error: `API key is required to fetch available models for ${provider}`
        })
    }

    try {
        let models: ModelInfo[] | undefined;

        if (provider === 'openai') {
            models = await fetchOpenAIModels(apiKey)
        } else if (provider === 'anthropic') {
            models = await fetchAnthropicModels(apiKey)
        } else if (provider === 'gemini') {
            models = await fetchGeminiModels(apiKey)
        } else {
            return NextResponse.json(
                { error: 'Invalid provider. Use "openai", "anthropic", or "gemini"' },
                { status: 400 }
            )
        }

        return NextResponse.json({ models })
    } catch (error) {
        console.error(`Error fetching ${provider} models:`, error)
        return NextResponse.json({
            models: [],
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`OpenAI API error (${response.status}): ${errorData}`)
    }

    const data = await response.json()

    interface OpenAIModel {
        id: string
        object: string
        created: number
        owned_by: string
    }

    interface OpenAIModelsResponse {
        data: OpenAIModel[]
        object: string
    }

    const responseData = data as OpenAIModelsResponse

    const chatModels = responseData.data
        .filter((model) => {
            const modelId = model.id.toLowerCase()
            const isGptModel = modelId.includes('gpt')
            const isExcluded =
                modelId.includes('instruct') ||
                modelId.includes('embedding') ||
                modelId.includes('-if-') ||
                modelId.includes('vision') ||
                modelId.includes('audio') ||
                modelId.includes('whisper') ||
                modelId.includes('dalle') ||
                modelId.includes('tts') ||
                modelId.includes('transcribe') ||
                modelId.includes('realtime') ||
                modelId.includes('search')
            return isGptModel && !isExcluded
        })
        .map(
            (model): ModelInfo => ({
                id: model.id,
                name: model.id,
                provider: 'openai' as SupportedProvider,
            })
        )
        .sort((a, b) => {
            if (a.id.includes('gpt-4') && !b.id.includes('gpt-4')) return -1
            if (!a.id.includes('gpt-4') && b.id.includes('gpt-4')) return 1
            return b.id.localeCompare(a.id)
        })

    if (chatModels.length === 0) {
        throw new Error('No compatible chat models found in your OpenAI account')
    }

    return chatModels
}

async function fetchAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Anthropic API error (${response.status}): ${errorData}`)
    }

    const data = await response.json()

    interface AnthropicModel {
        id: string
        type: string // Added type, as per Anthropic's API structure
        name: string // Anthropic uses 'name' for the model ID (e.g., "claude-3-opus-20240229")
        display_name: string // Added for user-friendly name
        created_at: string // Added for sorting
    }

    interface AnthropicModelsResponse {
        data: AnthropicModel[]
        // has_more: boolean; // Not strictly needed for our mapping
        // first_id?: string; // Not strictly needed
    }

    const responseData = data as AnthropicModelsResponse

    if (!responseData.data || !Array.isArray(responseData.data)) {
        throw new Error('Unexpected response format from Anthropic API')
    }

    return responseData.data
        .filter(model => model.id.includes('claude') && !model.id.includes('instant') && !model.id.includes('vision')) // Basic filter for chat models
        .map(model => ({
            id: model.id, // Use Anthropic's model ID directly
            name: model.display_name || model.id, // Prefer display_name, fallback to id
            provider: 'anthropic' as SupportedProvider,
        }))
        .sort((a, b) => {
            const aIsC3 = a.id.includes('claude-3');
            const bIsC3 = b.id.includes('claude-3');

            if (aIsC3 && !bIsC3) return -1;
            if (!aIsC3 && bIsC3) return 1;

            return b.id.localeCompare(a.id);
        });
}

async function fetchGeminiModels(apiKey: string): Promise<ModelInfo[]> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const errorData = await response.text();
        try {
            const jsonError = JSON.parse(errorData);
            if (jsonError && jsonError.error && jsonError.error.message) {
                throw new Error(`Gemini API error (${response.status}): ${jsonError.error.message}`);
            }
        } catch (e) {
            console.error('Error parsing Gemini API error:', e);
        }
        throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();

    interface GeminiModel {
        name: string;
        baseModelId?: string;
        version: string;
        displayName: string;
        description: string;
        inputTokenLimit: number;
        outputTokenLimit: number;
        supportedGenerationMethods: string[];
    }

    interface GeminiModelsResponse {
        models: GeminiModel[];
        nextPageToken?: string;
    }

    const responseData = data as GeminiModelsResponse;

    if (!responseData.models || !Array.isArray(responseData.models)) {
        throw new Error('Unexpected response format from Gemini API');
    }

    const allModels = responseData.models
        .map(
            (model): ModelInfo => ({
                id: model.baseModelId || (model.name.startsWith('models/') ? model.name.split('/').pop()! : model.name),
                name: model.displayName || model.name,
                provider: 'gemini' as SupportedProvider,
            })
        )
        // Sort models: Pro versions first, then Flash. Within those, sort by name (which might include versioning)
        .sort((a, b) => {
            const aIsPro = a.name.toLowerCase().includes('pro');
            const bIsPro = b.name.toLowerCase().includes('pro');
            const aIsFlash = a.name.toLowerCase().includes('flash');
            const bIsFlash = b.name.toLowerCase().includes('flash');

            if (aIsPro && !bIsPro) return -1;
            if (!aIsPro && bIsPro) return 1;
            if (aIsFlash && !bIsFlash) return -1;
            if (!aIsFlash && bIsFlash) return 1;

            return a.name.localeCompare(b.name);
        });

    if (allModels.length === 0) {
        // Updated error message to be more generic
        throw new Error('No models found for your Gemini account, or API key is invalid/misconfigured.');
    }
    return allModels; // Return all mapped and sorted models
} 
import { SupportedProvider } from '@/types/models';

// Basic obfuscation (not true encryption)
function simpleObfuscate(key: string): string {
    const fixedXORKey = 'mcp-chef-simulator-xor-key-2024';
    let result = '';
    for (let i = 0; i < key.length; i++) {
        result += String.fromCharCode(key.charCodeAt(i) ^ fixedXORKey.charCodeAt(i % fixedXORKey.length));
    }
    try {
        return btoa(result);
    } catch (e) {
        console.error("Error in btoa during obfuscation:", e);
        return key; // Fallback to unencrypted if btoa fails (e.g. non-latin1 chars unexpectedly)
    }
}

function simpleDeobfuscate(obfuscatedKey: string): string {
    try {
        const fromBase64 = atob(obfuscatedKey);
        const fixedXORKey = 'mcp-chef-simulator-xor-key-2024';
        let result = '';
        for (let i = 0; i < fromBase64.length; i++) {
            result += String.fromCharCode(fromBase64.charCodeAt(i) ^ fixedXORKey.charCodeAt(i % fixedXORKey.length));
        }
        return result;
    } catch (e) {
        console.error("Error deobfuscating key:", e);
        return ''; // Return empty or handle error appropriately
    }
}

export function storeApiKey(provider: SupportedProvider, apiKey: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        const obfuscatedKey = simpleObfuscate(apiKey);
        sessionStorage.setItem(`mcp_apiKey_${provider}`, obfuscatedKey);
    }
}

export function getApiKey(provider: SupportedProvider): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        const obfuscatedKey = sessionStorage.getItem(`mcp_apiKey_${provider}`);
        if (!obfuscatedKey) return null;
        return simpleDeobfuscate(obfuscatedKey);
    }
    return null;
}

export function storeLastProvider(provider: SupportedProvider): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('mcp_lastProvider', provider);
    }
}

export function getLastProvider(): SupportedProvider | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem('mcp_lastProvider') as SupportedProvider | null;
    }
    return null;
}

export function storeLastModel(modelId: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('mcp_lastModel', modelId);
    }
}

export function getLastModel(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem('mcp_lastModel');
    }
    return null;
}

export function clearStoredLLMSettings(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('mcp_apiKey_')) {
                sessionStorage.removeItem(key);
            }
        });
        sessionStorage.removeItem('mcp_lastProvider');
        sessionStorage.removeItem('mcp_lastModel');
    }
} 
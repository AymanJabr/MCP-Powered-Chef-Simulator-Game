declare module 'mcp-sdk' {
    // Minimal type definitions required for compilation
    export interface MCPServerOptions {
        name: string
        tools: readonly unknown[]
        resources?: readonly unknown[]
        getContext: () => any
    }

    export class MCPServer {
        constructor(options: MCPServerOptions)
    }
} 
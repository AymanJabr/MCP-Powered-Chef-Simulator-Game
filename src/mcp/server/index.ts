import { MCPServer } from 'mcp-sdk'
import { tools } from './tools'
import { resources } from './resources'
import { gameStateToContext } from './integration'
import { eventBus } from '@/lib/eventBus'

/**
 * Initialise and return a fully-configured MCP server instance.
 * The server exposes:
 *   • Game context (game, restaurant & kitchen summaries)
 *   • A rich set of tools mirroring player capabilities
 *   • Real-time resources the LLM can request
 *
 * If the initialisation fails the error is logged and `null` is returned
 * so the caller can decide how to recover.
 */
export function setupMCPServer() {
    try {
        const server = new MCPServer({
            name: 'chef-simulator-mcp',
            tools,
            resources,
            /**
             * `getContext` is invoked by the MCP runtime before every
             * LLM request. It should be cheap and side-effect free.
             */
            getContext: () => gameStateToContext()
        })

        // Emit an activation event so the UI can react to the server being ready
        eventBus.emit('mcp_activated')
        return server
    } catch (error) {
        console.error('[MCP] Failed to initialise server:', error)
        return null
    }
} 
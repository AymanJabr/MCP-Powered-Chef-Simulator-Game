import { resources } from './resources'
import { MCPContext, MCPResourceDataType, MCPErrorContext } from '@/types/models'

/**
 * Gather the latest data from all MCP resources and consolidate them into a
 * single object suitable for passing to the LLM as contextual JSON.
 *
 * Because resources are already responsible for shaping their output this
 * function simply iterates over them and maps the data.
 */
export function gameStateToContext(): MCPContext {
    const ctx: Record<string, MCPResourceDataType | MCPErrorContext> = {}

    for (const res of resources) {
        try {
            ctx[res.name] = res.get() as MCPResourceDataType
        } catch (err) {
            ctx[res.name] = { error: (err as Error).message }
        }
    }

    return ctx as MCPContext
} 
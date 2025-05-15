jest.mock('../integration', () => ({
    gameStateToContext: jest.fn(() => ({}))
}))

import { setupMCPServer } from '../index'
import { MCPServer } from 'mcp-sdk'
import { tools } from '../tools'
import { resources } from '../resources'
import { gameStateToContext } from '../integration'

jest.mock('mcp-sdk', () => ({
    MCPServer: jest.fn()
}))

describe('MCP Server Setup', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (MCPServer as unknown as jest.Mock).mockImplementation(() => ({
                name: 'chef-simulator-mcp'
            }))
    })

    it('should create an MCP server instance with correct configuration', () => {
        const server = setupMCPServer()
        expect(MCPServer).toHaveBeenCalledWith({
            name: 'chef-simulator-mcp',
            tools,
            resources,
            getContext: expect.any(Function)
        })
        expect(server).toBeDefined()
    })

    it('should call gameStateToContext via getContext', () => {
        setupMCPServer()
        const getContext = (MCPServer as unknown as jest.Mock).mock.calls[0][0].getContext
        getContext()
        expect(gameStateToContext).toHaveBeenCalled()
    })

    it('should handle initialization errors and return null', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (MCPServer as unknown as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Init error')
            })
        expect(setupMCPServer()).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })
}) 
import { tools } from '../tools'

const seatCustomer = jest.fn()

// mocks
const moveToArea = jest.fn()
const startAction = jest.fn(() => 'action123')

jest.mock('@/state/game/restaurantStore', () => ({
    useRestaurantStore: {
        getState: jest.fn(() => ({ actions: { seatCustomer } }))
    }
}))

jest.mock('@/state/player/playerStore', () => ({
    usePlayerStore: {
        getState: jest.fn(() => ({
            player: { id: 'player1' },
            actions: { moveToArea, startAction }
        }))
    }
}))

describe('MCP Tools', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should export a non-empty tools array', () => {
        expect(Array.isArray(tools)).toBe(true)
        expect(tools.length).toBeGreaterThan(0)
    })

    it('each tool should have required properties', () => {
        tools.forEach((t) => {
            expect(t).toHaveProperty('name')
            expect(t).toHaveProperty('description')
            expect(t).toHaveProperty('parameters')
            expect(typeof t.execute).toBe('function')
        })
    })

    it('greet_customer executes and calls seatCustomer action', async () => {
        const greet = tools.find((t) => t.name === 'greet_customer')!
        seatCustomer.mockReturnValue({ success: true })

        const result = await greet.execute({ customer_id: 'cust1', table_id: 'tableA' })
        expect(seatCustomer).toHaveBeenCalledWith('cust1', 'tableA')
        expect(result).toEqual({ success: true })
    })

    it('move_player executes and calls moveToArea', async () => {
        const moveTool = tools.find((t) => t.name === 'move_player')!
        moveToArea.mockClear()
        const result = await moveTool.execute({ area: 'dining', x: 5, y: 3 })
        expect(moveToArea).toHaveBeenCalledWith('dining', 5, 3)
        expect(result).toEqual({ success: true, position: { area: 'dining', x: 5, y: 3 } })
    })

    it('clean_area executes and starts a clean action', async () => {
        const cleanTool = tools.find((t) => t.name === 'clean_area')!
        startAction.mockClear()
        startAction.mockReturnValue('clean123')
        const result = await cleanTool.execute({ target_id: 'table9', duration_ms: 10000 })
        expect(startAction).toHaveBeenCalledWith('clean', 'table9', 10000)
        expect(result).toEqual({ success: true, actionId: 'clean123' })
    })
}) 
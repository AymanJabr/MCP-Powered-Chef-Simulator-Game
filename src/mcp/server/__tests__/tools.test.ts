import { tools } from '../tools'

const seatCustomer = jest.fn()

jest.mock('@/state/game/restaurantStore', () => ({
    useRestaurantStore: {
        getState: jest.fn(() => ({ actions: { seatCustomer } }))
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
}) 
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import PerformanceMetrics from '../PerformanceMetrics'

const metrics = {
    customerSatisfaction: 75,
    orderCompletionTime: 60,
    financialPerformance: 1200,
    efficiency: 88,
}

describe('PerformanceMetrics', () => {
    it('displays metrics values', () => {
        render(<MantineProvider><PerformanceMetrics metrics={metrics as any} /></MantineProvider>)
        expect(screen.getByText('75')).toBeInTheDocument()
        expect(screen.getByText('60')).toBeInTheDocument()
        expect(screen.getByText('1200')).toBeInTheDocument()
        expect(screen.getByText('88')).toBeInTheDocument()
    })
}) 
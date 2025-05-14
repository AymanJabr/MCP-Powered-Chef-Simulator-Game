import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type GamePhase = 'tutorial' | 'preGame' | 'active' | 'gameOver'
export type GameMode = 'manual' | 'mcp'

interface GameState {
    gameMode: GameMode
    difficulty: number
    timeElapsed: number
    isPaused: boolean
    gamePhase: GamePhase
    performanceMetrics: {
        customerSatisfaction: number
        orderCompletionTime: number
        financialPerformance: number
        efficiency: number
    }
    settings: {
        audioEnabled: boolean
        sfxVolume: number
        musicVolume: number
        tutorialCompleted: boolean
    }
    actions: {
        setGameMode: (mode: GameMode) => void
        setGamePhase: (phase: GamePhase) => void
        increaseTime: (seconds: number) => void
        togglePause: () => void
        resetGame: () => void
        setDifficulty: (difficulty: number) => void
    }
}

export const useGameStore = create<GameState>()(
    immer((set) => ({
        gameMode: 'manual',
        difficulty: 1,
        timeElapsed: 0,
        isPaused: false,
        gamePhase: 'preGame',
        performanceMetrics: {
            customerSatisfaction: 0,
            orderCompletionTime: 0,
            financialPerformance: 0,
            efficiency: 0,
        },
        settings: {
            audioEnabled: true,
            sfxVolume: 0.7,
            musicVolume: 0.5,
            tutorialCompleted: false,
        },
        actions: {
            setGameMode: (mode) => set((state) => {
                state.gameMode = mode
            }),
            setGamePhase: (phase) => set((state) => {
                state.gamePhase = phase
            }),
            increaseTime: (seconds) => set((state) => {
                state.timeElapsed += seconds

                // Increase difficulty with time
                if (state.timeElapsed % 60 === 0 && state.difficulty < 10) {
                    state.difficulty += 0.1
                }
            }),
            togglePause: () => set((state) => {
                state.isPaused = !state.isPaused
            }),
            resetGame: () => set((state) => {
                state.timeElapsed = 0
                state.difficulty = 1
                state.gamePhase = 'preGame'
                state.performanceMetrics = {
                    customerSatisfaction: 0,
                    orderCompletionTime: 0,
                    financialPerformance: 0,
                    efficiency: 0,
                }
            }),
            setDifficulty: (difficulty) => set((state) => {
                state.difficulty = difficulty
            }),
        }
    }))
) 
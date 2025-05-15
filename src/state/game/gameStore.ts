import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Game, GamePhase, GameMode } from '@/types/models'

interface GameState {
    game: Game
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
        game: {
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
            }
        },
        actions: {
            setGameMode: (mode) => set((state) => {
                state.game.gameMode = mode
            }),

            setGamePhase: (phase) => set((state) => {
                state.game.gamePhase = phase
            }),

            increaseTime: (seconds) => set((state) => {
                state.game.timeElapsed += seconds

                // Increase difficulty with time – grows unbounded (modifiers clamp extreme values)
                if (state.game.timeElapsed % 60 === 0) {
                    state.game.difficulty += 0.1
                }
            }),

            togglePause: () => set((state) => {
                state.game.isPaused = !state.game.isPaused
            }),

            resetGame: () => set((state) => {
                state.game.timeElapsed = 0
                state.game.difficulty = 1
                state.game.gamePhase = 'preGame'
                state.game.performanceMetrics = {
                    customerSatisfaction: 0,
                    orderCompletionTime: 0,
                    financialPerformance: 0,
                    efficiency: 0,
                }
                // Note: we don't reset game mode or settings as those are user preferences
            }),

            setDifficulty: (difficulty) => set((state) => {
                state.game.difficulty = difficulty
            }),
        }
    }))
) 
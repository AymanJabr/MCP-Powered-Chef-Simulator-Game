import { playSfx, playMusic, stopAllSounds, setSfxVolume } from '@/lib/audio'
import { Howl } from 'howler'

jest.mock('howler', () => {
    const mockPlay = jest.fn()
    const mockStop = jest.fn()
    const mockVolume = jest.fn()

    const HowlMock = jest.fn().mockImplementation(() => ({
        play: mockPlay,
        stop: mockStop,
        volume: mockVolume,
    }))

    return {
        __esModule: true,
        Howl: HowlMock,
        _mocks: { mockPlay, mockStop, mockVolume },
    }
})

// Define interfaces for the mocked howler module
interface HowlerModuleMocks {
    mockPlay: jest.Mock
    mockStop: jest.Mock
    mockVolume: jest.Mock
}

interface HowlerModuleMock {
    __esModule: boolean
    Howl: jest.Mock
    _mocks: HowlerModuleMocks
}

// Helper to access mocks from the mocked module --------------------------------
function getMocks(): HowlerModuleMocks {
    return (jest.requireMock('howler') as HowlerModuleMock)._mocks
}

describe('Audio utility', () => {
    beforeEach(() => {
        const { mockPlay, mockStop, mockVolume } = getMocks()
        mockPlay.mockClear()
        mockStop.mockClear()
        mockVolume.mockClear()
            ; (Howl as jest.Mock).mockClear()
    })

    it('plays a sound effect via playSfx', () => {
        playSfx('bell')
        const { mockPlay } = getMocks()
        expect(mockPlay).toHaveBeenCalled()
    })

    it('plays background music with playMusic', () => {
        playMusic('calm')
        const { mockPlay } = getMocks()
        expect(mockPlay).toHaveBeenCalled()
    })

    it('stops all sounds', () => {
        playSfx('chop')
        playMusic('medium')
        stopAllSounds()
        const { mockStop } = getMocks()
        expect(mockStop).toHaveBeenCalled()
    })

    it('sets volumes correctly', () => {
        setSfxVolume(0.5)
        const { mockVolume } = getMocks()
        expect(mockVolume).toHaveBeenCalled()
    })
}) 
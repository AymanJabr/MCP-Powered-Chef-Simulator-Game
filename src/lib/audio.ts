import { Howl } from 'howler'
import type { SfxName, MusicIntensity } from '@/types/models'

// -----------------------------------------------------------------------------
// Internal helpers ------------------------------------------------------------
// -----------------------------------------------------------------------------

function createSfx(src: string, loop = false): Howl {
    return new Howl({ src: [src], loop })
}

// -----------------------------------------------------------------------------
// Sound registry --------------------------------------------------------------
// -----------------------------------------------------------------------------

const sfxRegistry: Record<SfxName, Howl> = {
    cookingStart: createSfx('/assets/audio/sfx/cooking_start.mp3'),
    cookingComplete: createSfx('/assets/audio/sfx/cooking_complete.mp3'),
    chop: createSfx('/assets/audio/sfx/prep_chop.mp3'),
    sizzle: createSfx('/assets/audio/sfx/cooking_sizzle.mp3', true),
    customerHappy: createSfx('/assets/audio/sfx/customer_happy.mp3'),
    customerAngry: createSfx('/assets/audio/sfx/customer_angry.mp3'),
    bell: createSfx('/assets/audio/sfx/bell.mp3'),
}

const musicRegistry: Record<MusicIntensity, Howl> = {
    calm: new Howl({
        src: ['/assets/audio/music/upbeat_low.mp3'],
        loop: true,
        volume: 0.5,
    }),
    medium: new Howl({
        src: ['/assets/audio/music/upbeat_medium.mp3'],
        loop: true,
        volume: 0.5,
    }),
    intense: new Howl({
        src: ['/assets/audio/music/upbeat_high.mp3'],
        loop: true,
        volume: 0.5,
    }),
}

// -----------------------------------------------------------------------------
// Public API ------------------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Play a short, non-looping sound-effect.
 */
export function playSfx(name: SfxName): void {
    const sound = sfxRegistry[name]
    if (!sound) return
    sound.stop() // restart if already playing
    sound.play()
}

/**
 * Begin playing a background music track for the provided intensity.
 * Any music already playing will be stopped before the requested track begins.
 */
export function playMusic(intensity: MusicIntensity): void {
    // Stop all music first
    (Object.values(musicRegistry) as Howl[]).forEach((track: Howl) => {
        track.stop()
    })
    musicRegistry[intensity].play()
}

/**
 * Stop every currently playing sound, including SFX and music.
 */
export function stopAllSounds(): void {
    // Stop SFX
    (Object.values(sfxRegistry) as Howl[]).forEach((sfx: Howl) => {
        sfx.stop()
    })

        // Stop music
        ; (Object.values(musicRegistry) as Howl[]).forEach((track: Howl) => {
            track.stop()
        })
}

/**
 * Update the master volume for all sound effects.
 */
export function setSfxVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    (Object.values(sfxRegistry) as Howl[]).forEach((sfx: Howl) => {
        sfx.volume(clamped)
    })
}

/**
 * Update the master volume for background music tracks.
 */
export function setMusicVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    (Object.values(musicRegistry) as Howl[]).forEach((track: Howl) => {
        track.volume(clamped)
    })
} 
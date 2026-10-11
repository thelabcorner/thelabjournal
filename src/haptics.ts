import { CoreEngine } from './vendor/webhaptics-v2/core/engine'
import type { Vibration } from './vendor/webhaptics-v2/core/types'

export type HapticCue = 'selection' | 'light' | 'success' | 'nudge' | 'error'
const preference = 'thelabcorner.journal.haptics.v2'
let engine: CoreEngine | null = null
let sessionPreference: boolean | null = null

export function hapticsEnabled(): boolean {
  if (sessionPreference !== null) return sessionPreference
  try { return localStorage.getItem(preference) !== 'off' } catch { return true }
}

export function setHapticsEnabled(value: boolean) {
  const wasEnabled = hapticsEnabled()
  sessionPreference = value
  try { localStorage.setItem(preference, value ? 'on' : 'off') } catch { /* Session still works. */ }
  if (!value && wasEnabled) engine?.cancel()
}

const cueDuration: Record<HapticCue, number> = {
  selection: 8,
  light: 15,
  success: 30,
  nudge: 80,
  error: 40,
}

/**
 * Native actuator scheduling occurs synchronously inside the original user
 * gesture; the delay is encoded into the WebHaptics V2 vibration pattern.
 * setTimeout(engine.trigger) risks losing mobile transient user activation.
 * Navigation itself is never delayed.
 */
export function cueDelayed(name: HapticCue, delayMs = 65): void {
  if (!hapticsEnabled() || typeof window === 'undefined') return
  try {
    engine ??= new CoreEngine({ reducedMotion: 'respect', debug: false, showToggle: false })
    const vibration: Vibration = {
      delay: Math.max(0, Math.min(150, Math.round(delayMs))),
      duration: cueDuration[name],
      intensity: name === 'success' ? 0.48 : 0.3,
    }
    void engine.trigger([vibration], { intensity: vibration.intensity }).catch(() => {})
  } catch { /* Graceful fallback if tactile output is unsupported. */ }
}

/** Trigger a regular V2 cue in the direct user interaction. */
export function cue(name: HapticCue): void {
  if (!hapticsEnabled() || typeof window === 'undefined') return
  try {
    engine ??= new CoreEngine({ reducedMotion: 'respect', debug: false, showToggle: false })
    void engine.trigger(name, { intensity: name === 'success' ? 0.48 : 0.3 }).catch(() => {})
  } catch { /* Interaction remains fully functional without tactile support. */ }
}

export function disposeHaptics(): void {
  const previous = engine
  engine = null
  if (previous) void previous.destroy()
}

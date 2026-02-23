export interface SkillEffectEvent {
  skillId: string
  color: string
  x: number  // normalized 0-1 screen position
  y: number
  isWow: boolean
}

type Listener = (event: SkillEffectEvent) => void

const listeners = new Set<Listener>()

export function onSkillEffect(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitSkillEffect(event: SkillEffectEvent): void {
  listeners.forEach(fn => fn(event))
}

// Click tracking for wow detection
const clickTimestamps: Record<string, number[]> = {}
let wowCooldownUntil = 0
const WOW_WINDOW = 2000
const WOW_THRESHOLD = 5
const WOW_COOLDOWN = 3000
const DEBOUNCE_MS = 150

let lastClickTime = 0

export function handleSkillClick(skillId: string, color: string, x: number, y: number): void {
  const now = Date.now()

  if (!clickTimestamps[skillId]) clickTimestamps[skillId] = []
  clickTimestamps[skillId].push(now)
  clickTimestamps[skillId] = clickTimestamps[skillId].filter(t => now - t < WOW_WINDOW)

  if (clickTimestamps[skillId].length >= WOW_THRESHOLD && now > wowCooldownUntil) {
    clickTimestamps[skillId] = []
    wowCooldownUntil = now + WOW_COOLDOWN
    emitSkillEffect({ skillId, color, x, y, isWow: true })
    return
  }

  if (now - lastClickTime < DEBOUNCE_MS) return
  lastClickTime = now

  emitSkillEffect({ skillId, color, x, y, isWow: false })
}

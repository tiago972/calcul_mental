import { generate } from './generators'
import { pickType, recentRates, weights } from './sampling'
import { median, successRate } from './stats'
import { TYPE_IDS } from './types'
import type { Attempt, Question, Rng, TypeId, TypeState } from './types'

export const BLOCKS = 3
export const BLOCK_MS = 5 * 60_000
export const PAUSE_MS = 30_000
export const DEFAULT_TARGET_MS = 20_000
/**
 * Deux secondes ne laissent pas le temps de lire le chemin de calcul, qui est
 * la seule chose à retenir de la correction. Réglable, 0 = passage au tap.
 */
export const DEFAULT_FEEDBACK_MS = 4_000
export const FEEDBACK_CHOICES = [2_000, 4_000, 6_000, 0] as const

export const SESSION_MS = BLOCKS * BLOCK_MS + (BLOCKS - 1) * PAUSE_MS

/** Tire le type le plus utile puis la question, au niveau mémorisé pour ce type. */
export function nextQuestion(
  levels: Record<TypeId, TypeState>,
  history: readonly Attempt[],
  rng: Rng,
): Question {
  const id = pickType(weights(recentRates(history)), rng)
  return generate(id, levels[id].level, rng)
}

export type SessionOutcome = {
  n: number
  medianMs: number | null
  rate: number | null
  /** Part des réponses justes mais hors délai — le symptôme « lent et exact ». */
  lateShare: number
}

export function outcome(attempts: readonly Attempt[], targetMs: number): SessionOutcome {
  const n = attempts.length
  const late = attempts.filter((a) => a.correct && a.ms > targetMs).length
  return {
    n,
    medianMs: median(attempts.map((a) => a.ms)),
    rate: successRate(attempts),
    lateShare: n === 0 ? 0 : late / n,
  }
}

export type Advice = { key: string; typeId?: TypeId }

/**
 * Une seule phrase pour le lendemain. L'ordre des tests est délibéré :
 * la lenteur passe avant la précision, c'est le défaut qu'on vise.
 */
export function advise(
  attempts: readonly Attempt[],
  targetMs: number,
  weakestType?: TypeId,
): Advice {
  const o = outcome(attempts, targetMs)
  if (o.n < 5) return { key: 'advice.empty' }
  if (o.lateShare >= 0.3) return { key: 'advice.slow' }
  if ((o.rate ?? 1) < 0.7) return { key: 'advice.rushed' }
  if (weakestType && (o.rate ?? 1) < 0.9) return { key: 'advice.weakType', typeId: weakestType }
  return { key: 'advice.good' }
}

/** État initial des douze niveaux. */
export function initialLevels(): Record<TypeId, TypeState> {
  const out = {} as Record<TypeId, TypeState>
  for (const id of TYPE_IDS) out[id] = { level: 1, goodStreak: 0, failStreak: 0 }
  return out
}

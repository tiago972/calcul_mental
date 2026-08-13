import type { Level, TypeState } from './types'

export const MIN_LEVEL: Level = 1
export const MAX_LEVEL: Level = 5

/** Bonnes réponses consécutives, sous la cible de temps, pour monter d'un cran. */
export const UP_AFTER = 4
/** Échecs consécutifs pour descendre d'un cran. */
export const DOWN_AFTER = 2

export function initialTypeState(level: Level = 1): TypeState {
  return { level, goodStreak: 0, failStreak: 0 }
}

export type AttemptResult = {
  /** Réponse dans la tolérance. */
  correct: boolean
  ms: number
  targetMs: number
}

/**
 * Une tentative est un succès seulement si elle est juste ET sous la cible :
 * dépasser le chrono compte comme un échec, c'est tout l'objet de l'entraînement.
 */
export function isSuccess(r: AttemptResult): boolean {
  return r.correct && r.ms <= r.targetMs
}

export function nextLevel(s: TypeState, r: AttemptResult): TypeState {
  const good = isSuccess(r)
  const goodStreak = good ? s.goodStreak + 1 : 0
  const failStreak = good ? 0 : s.failStreak + 1

  if (goodStreak >= UP_AFTER && s.level < MAX_LEVEL) {
    // Un changement de niveau remet les deux compteurs à zéro : sans cela on
    // oscille entre deux niveaux au rythme d'une réponse sur deux.
    return { level: (s.level + 1) as Level, goodStreak: 0, failStreak: 0 }
  }
  if (failStreak >= DOWN_AFTER && s.level > MIN_LEVEL) {
    return { level: (s.level - 1) as Level, goodStreak: 0, failStreak: 0 }
  }
  return { level: s.level, goodStreak, failStreak }
}

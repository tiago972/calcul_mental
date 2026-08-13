import { TYPE_IDS } from './types'
import type { Attempt, Rng, TypeId } from './types'

/**
 * Part minimale garantie à chaque type. Le cahier des charges demandait 10 %,
 * ce qui est arithmétiquement impossible à douze types (120 %) : on retient la
 * moitié de la part uniforme (1/12 ≈ 8,3 %), soit environ une question de
 * chaque type toutes les deux sessions.
 */
export const FLOOR = 0.04

/** Fenêtre glissante servant au « taux de réussite récent ». */
export const RECENT = 30

/** Poids accordé à un type jamais rencontré : le maximum. */
const UNSEEN_BASE = 1
/** Plancher additif : un type réussi à 100 % garde une présence non nulle. */
const BASE_OFFSET = 0.15

export type Rates = Record<TypeId, number | null>

/** Taux de réussite sur les `RECENT` dernières tentatives, par type. */
export function recentRates(attempts: readonly Attempt[], window = RECENT): Rates {
  const out = {} as Rates
  for (const id of TYPE_IDS) {
    const last = attempts.filter((a) => a.typeId === id).slice(-window)
    out[id] = last.length === 0 ? null : last.filter((a) => a.correct).length / last.length
  }
  return out
}

/**
 * Échantillonnage inversement proportionnel à la réussite, puis mélange affine
 * avec la loi uniforme pour garantir le plancher. La somme vaut exactement 1.
 */
export function weights(rates: Rates, floor = FLOOR): Record<TypeId, number> {
  const n = TYPE_IDS.length
  const base = TYPE_IDS.map((id) => {
    const r = rates[id]
    return r === null ? UNSEEN_BASE : 1 - r + BASE_OFFSET
  })
  const sum = base.reduce((a, b) => a + b, 0)
  const spread = 1 - n * floor
  const out = {} as Record<TypeId, number>
  TYPE_IDS.forEach((id, i) => {
    out[id] = floor + spread * (base[i] / sum)
  })
  return out
}

export function pickType(w: Record<TypeId, number>, rng: Rng): TypeId {
  const total = TYPE_IDS.reduce((a, id) => a + w[id], 0)
  let t = rng.next() * total
  for (const id of TYPE_IDS) {
    t -= w[id]
    if (t <= 0) return id
  }
  return TYPE_IDS[TYPE_IDS.length - 1]
}

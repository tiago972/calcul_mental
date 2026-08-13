import { TYPE_IDS } from './types'
import type { Attempt, Level, TypeId, TypeState } from './types'

export const DAY_MS = 86_400_000

/** Clé de jour locale, « YYYY-MM-DD ». C'est l'unité de la série. */
export function dayKey(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + days).getTime())
}

/**
 * Série de jours consécutifs se terminant aujourd'hui ou hier — laisser courir
 * la journée en cours évite de remettre le compteur à zéro à minuit.
 */
export function streak(days: readonly string[], today: string): number {
  const set = new Set(days)
  let cursor = set.has(today) ? today : shiftDay(today, -1)
  if (!set.has(cursor)) return 0
  let n = 0
  while (set.has(cursor)) {
    n++
    cursor = shiftDay(cursor, -1)
  }
  return n
}

export function median(xs: readonly number[]): number | null {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const mid = s.length >> 1
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export function successRate(attempts: readonly Attempt[]): number | null {
  if (attempts.length === 0) return null
  return attempts.filter((a) => a.correct).length / attempts.length
}

export type TypeRow = {
  typeId: TypeId
  n: number
  rate: number | null
  medianMs: number | null
  level: Level
  /** Écart de temps médian sur 30 jours, en ms. Négatif = plus rapide. Null si trop peu de données. */
  trendMs: number | null
}

const MIN_FOR_TREND = 5

export function trend30(
  attempts: readonly Attempt[],
  typeId: TypeId,
  now: number,
): number | null {
  const recent = attempts.filter(
    (a) => a.typeId === typeId && a.ts > now - 30 * DAY_MS,
  )
  const before = attempts.filter(
    (a) => a.typeId === typeId && a.ts > now - 60 * DAY_MS && a.ts <= now - 30 * DAY_MS,
  )
  if (recent.length < MIN_FOR_TREND || before.length < MIN_FOR_TREND) return null
  const mr = median(recent.map((a) => a.ms))
  const mb = median(before.map((a) => a.ms))
  return mr === null || mb === null ? null : mr - mb
}

export function byType(
  attempts: readonly Attempt[],
  levels: Record<TypeId, TypeState>,
  now: number,
): TypeRow[] {
  return TYPE_IDS.map((typeId) => {
    const rows = attempts.filter((a) => a.typeId === typeId)
    return {
      typeId,
      n: rows.length,
      rate: successRate(rows),
      medianMs: median(rows.map((a) => a.ms)),
      level: levels[typeId]?.level ?? 1,
      trendMs: trend30(attempts, typeId, now),
    }
  })
}

/** Les types les plus faibles : réussite basse d'abord, temps médian ensuite. */
export function weakest(rows: readonly TypeRow[], k = 2, minN = 3): TypeRow[] {
  return rows
    .filter((r) => r.n >= minN)
    .sort((a, b) => (a.rate ?? 1) - (b.rate ?? 1) || (b.medianMs ?? 0) - (a.medianMs ?? 0))
    .slice(0, k)
}

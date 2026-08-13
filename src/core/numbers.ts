import type { Num, Rng, Scale } from './types'

export const SCALE_FACTOR: Record<Scale, number> = {
  unit: 1,
  k: 1e3,
  M: 1e6,
  Md: 1e9,
}

/** Arrondi à `sig` chiffres significatifs. */
export function roundSig(x: number, sig: number): number {
  if (x === 0 || !Number.isFinite(x)) return x
  const mag = Math.ceil(Math.log10(Math.abs(x)))
  const f = Math.pow(10, sig - mag)
  return Math.round(x * f) / f
}

/** Nombre de chiffres significatifs réellement portés par `x`. */
export function sigDigits(x: number, max = 12): number {
  for (let s = 1; s < max; s++) if (roundSig(x, s) === x) return s
  return max
}

export function clamp(x: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, x))
}

type BusinessOpts = {
  min: number
  max: number
  /** Chiffres significatifs. 2 → 4 200 ; 3 → 4 230. */
  sig: number
  /** Refuse un dernier chiffre significatif nul (4 000 devient 4 200). */
  avoidRound?: boolean
}

/**
 * Tire un nombre « de cas » : magnitude choisie, peu de chiffres significatifs,
 * jamais un entier aléatoire à sept décimales.
 */
export function businessNumber(rng: Rng, o: BusinessOpts): number {
  const { min, max, sig, avoidRound = true } = o
  for (let i = 0; i < 32; i++) {
    const raw = min + rng.next() * (max - min)
    const v = clamp(roundSig(raw, sig), roundSig(min, sig), roundSig(max, sig))
    if (!avoidRound || sig === 1 || sigDigits(v) === sig) return v
  }
  return roundSig(min + (max - min) / 2, sig)
}

/** Pourcentage plausible, sur une grille (7 %, 12,5 %, 18 %…). */
export function percentLike(
  rng: Rng,
  o: { min: number; max: number; step: number },
): number {
  const n = Math.round((o.max - o.min) / o.step)
  const k = rng.int(0, n)
  return roundSig(o.min + k * o.step, 6)
}

/** Échelle de lecture d'une valeur brute : 1 596 000 se lit « 1,6 M ». */
export function pickScale(v: number): Scale {
  const a = Math.abs(v)
  if (a >= 1e9) return 'Md'
  if (a >= 1e6) return 'M'
  if (a >= 1e3) return 'k'
  return 'unit'
}

/** Convertit une valeur brute en couple (valeur lue, échelle). */
export function toScale(v: number, scale?: Scale): { v: number; scale: Scale } {
  const s = scale ?? pickScale(v)
  return { v: v / SCALE_FACTOR[s], scale: s }
}

/** Raccourcis de construction des `Num` passés aux clés i18n. */
export const money = (v: number, scale: Scale = 'unit', d?: number): Num => ({
  v,
  style: 'money',
  scale,
  d,
})
export const pct = (v: number, d?: number): Num => ({ v, style: 'percent', d })
export const plain = (v: number, scale: Scale = 'unit', d?: number): Num => ({
  v,
  style: 'plain',
  scale,
  d,
})
export const count = (v: number, scale: Scale = 'unit', d?: number): Num => ({
  v,
  style: 'count',
  scale,
  d,
})
export const frac = (n: number, den: number): Num => ({
  v: n / den,
  style: 'fraction',
  num: n,
  den,
})

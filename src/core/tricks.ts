import { plain } from './numbers'
import type { Phrase } from './types'

/**
 * Raccourcis de calcul mental reconnus, proposés seulement quand les nombres
 * tirés s'y prêtent. Chaque raccourci est une identité exacte, jamais une
 * approximation : les tests vérifient que la décomposition annoncée redonne
 * bien le facteur d'origine.
 */

/** Décompose 250 en mantisse 25 et puissance 10. Rend {m: x, p: 1} si non entier. */
export function mantissa(x: number): { m: number; p: number } {
  const a = Math.abs(x)
  if (!Number.isInteger(a) || a === 0) return { m: a, p: 1 }
  let m = a
  let p = 1
  while (m % 10 === 0) {
    m /= 10
    p *= 10
  }
  return { m, p }
}

/** Raccourci de multiplication, cherché sur l'un puis l'autre facteur. */
export function multiplyTrick(a: number, b: number): Phrase | null {
  for (const f of [b, a]) {
    const { m, p } = mantissa(f)
    switch (m) {
      case 5:
        // ×5 = ×10 puis la moitié.
        return { key: 'trick.mult.5', vars: { f: plain(f), x: plain(10 * p) } }
      case 9:
        return { key: 'trick.mult.9', vars: { f: plain(f), x: plain(10 * p), u: plain(p) } }
      case 11:
        return { key: 'trick.mult.11', vars: { f: plain(f), x: plain(10 * p), u: plain(p) } }
      case 12:
        return { key: 'trick.mult.12', vars: { f: plain(f), x: plain(10 * p), u: plain(2 * p) } }
      case 15:
        return { key: 'trick.mult.15', vars: { f: plain(f), x: plain(10 * p) } }
      case 25:
        return { key: 'trick.mult.25', vars: { f: plain(f), x: plain(100 * p) } }
    }
  }
  return null
}

/** Raccourci de division, cherché sur le diviseur. */
export function divideTrick(den: number): Phrase | null {
  const { m, p } = mantissa(den)
  switch (m) {
    case 2:
      return { key: 'trick.div.2', vars: { d: plain(den) } }
    case 4:
      return { key: 'trick.div.4', vars: { d: plain(den) } }
    case 5:
      // /5 = ×2 puis /10.
      return { key: 'trick.div.5', vars: { d: plain(den), x: plain(10 * p) } }
    case 25:
      return { key: 'trick.div.25', vars: { d: plain(den), x: plain(100 * p) } }
  }
  return null
}

/**
 * Raccourci de pourcentage. On s'en tient aux fractions exactes : 33 % n'est
 * pas un tiers, l'annoncer comme tel apprendrait une erreur.
 */
export function percentTrick(p: number): Phrase | null {
  const KEYS: Record<number, string> = {
    5: 'trick.pct.5',
    12.5: 'trick.pct.eighth',
    15: 'trick.pct.15',
    20: 'trick.pct.fifth',
    25: 'trick.pct.quarter',
    50: 'trick.pct.half',
    75: 'trick.pct.threeQuarters',
    90: 'trick.pct.90',
    95: 'trick.pct.95',
  }
  const key = KEYS[p]
  return key ? { key, vars: {} } : null
}

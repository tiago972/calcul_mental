import { roundSig } from './numbers'
import type { Question, Tolerance, Verdict } from './types'

/** Marge de sécurité en virgule flottante : 2 % pile doit passer. */
const EPS = 1e-9

export function tolerated(exact: number, tol: Tolerance): number {
  switch (tol.kind) {
    case 'rel':
      return (Math.abs(exact) * tol.pct) / 100
    case 'abs':
      return tol.delta
    case 'exact':
      return 0.5 * Math.pow(10, -(tol.d ?? 2))
  }
}

export function check(input: number, q: Question): Verdict {
  const diff = input - q.exact
  const band = tolerated(q.exact, q.tolerance)
  const ok = Math.abs(diff) <= band + EPS
  const rel = q.tolerance.kind === 'rel'
  return {
    ok,
    error: rel ? (q.exact === 0 ? 0 : (diff / Math.abs(q.exact)) * 100) : diff,
    errorUnit: rel ? 'pct' : 'pt',
  }
}

/**
 * La réponse « attendue » : le nombre le plus rond qui tienne encore dans la
 * tolérance. C'est le geste qu'on veut installer — poser 1,6 et non 1,596.
 */
export function roundestWithin(exact: number, tol: Tolerance): number {
  if (exact === 0 || !Number.isFinite(exact)) return exact
  if (tol.kind === 'exact') {
    const d = tol.d ?? 2
    return Math.round(exact * 10 ** d) / 10 ** d
  }
  const band = tolerated(exact, tol)
  for (let sig = 1; sig <= 8; sig++) {
    const r = roundSig(exact, sig)
    if (Math.abs(r - exact) <= band + EPS) return r
  }
  return exact
}

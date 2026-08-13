import { businessNumber, money, pct, percentLike, roundSig } from '../numbers'
import { build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = {
  rev: [number, number, number]
  gm: [number, number, number]
  /** Part de la marge brute absorbée par les coûts fixes. */
  u: [number, number]
  fixedSig: number
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { rev: [50, 200, 1], gm: [20, 60, 10], u: [0.4, 0.7], fixedSig: 1 },
  { rev: [50, 300, 2], gm: [20, 60, 5], u: [0.35, 0.75], fixedSig: 2 },
  { rev: [60, 400, 2], gm: [30, 60, 1], u: [0.3, 0.85], fixedSig: 2 },
  { rev: [80, 900, 3], gm: [20, 70, 0.5], u: [0.3, 0.88], fixedSig: 2 },
  { rev: [500, 3000, 3], gm: [15, 70, 0.5], u: [0.3, 0.9], fixedSig: 3 },
]

export const margin: ExerciseType = {
  id: 'margin',
  labelKey: 'type.margin',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const rev = businessNumber(rng, { min: c.rev[0], max: c.rev[1], sig: c.rev[2] })
    const gm = percentLike(rng, { min: c.gm[0], max: c.gm[1], step: c.gm[2] })
    const gross = (rev * gm) / 100
    // Le résultat reste positif : le pavé numérique n'a pas de touche « moins ».
    const fixed = roundSig(gross * (c.u[0] + rng.next() * (c.u[1] - c.u[0])), c.fixedSig)

    const exact = gross - fixed

    return build({
      typeId: 'margin',
      level,
      prompt: {
        key: 'q.margin.prompt',
        vars: { rev: money(rev, 'M'), gm: pct(gm), fixed: money(fixed, 'M') },
      },
      path: {
        key: 'q.margin.path',
        vars: {
          rev: money(rev, 'M'),
          gm: pct(gm),
          gross: money(roundSig(gross, 3), 'M'),
          fixed: money(fixed, 'M'),
          result: money(roundSig(exact, 3), 'M'),
        },
      },
      exact,
      answer: { style: 'money', scale: 'M' },
      tolerance: REL(2),
    })
  },
}

import { businessNumber, money, pct, percentLike, plain, roundSig, SCALE_FACTOR } from '../numbers'
import { asAnswer, build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = {
  base: [number, number, number]
  r: [number, number, number]
  y: [number, number]
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { base: [100, 900, 1], r: [5, 10, 5], y: [2, 2] },
  { base: [100, 900, 2], r: [3, 10, 1], y: [2, 3] },
  { base: [100, 900, 2], r: [3, 12, 1], y: [3, 5] },
  { base: [80, 2000, 2], r: [2, 15, 0.5], y: [4, 7] },
  { base: [80, 5000, 3], r: [-10, 20, 0.5], y: [5, 10] },
]

export const growthApply: ExerciseType = {
  id: 'growthApply',
  labelKey: 'type.growthApply',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const base = businessNumber(rng, { min: c.base[0], max: c.base[1], sig: c.base[2] })
    let r = percentLike(rng, { min: c.r[0], max: c.r[1], step: c.r[2] })
    if (Math.abs(r) < 1) r = 2
    const y = rng.int(c.y[0], c.y[1])

    // Le montant final peut franchir le milliard : l'unité de réponse suit.
    const raw = base * Math.pow(1 + r / 100, y)
    const { exact, answer } = asAnswer(raw * SCALE_FACTOR.M, 'money')
    const linear = r * y
    const compound = (Math.pow(1 + r / 100, y) - 1) * 100

    return build({
      typeId: 'growthApply',
      level,
      prompt: {
        key: 'q.growthApply.prompt',
        vars: { base: money(base, 'M'), r: pct(r), y: plain(y) },
      },
      path: {
        key: 'q.growthApply.path',
        vars: {
          r: pct(r),
          y: plain(y),
          linear: pct(roundSig(linear, 2)),
          compound: pct(roundSig(compound, 2)),
          base: money(base, 'M'),
          result: money(roundSig(exact, 3), answer.scale),
        },
      },
      exact,
      answer,
      tolerance: REL(3),
    })
  },
}

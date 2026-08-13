import { businessNumber, pct, percentLike, plain, roundSig } from '../numbers'
import { ABS, build, byLevel } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = {
  from: [number, number, number]
  g: [number, number, number]
  toSig: number
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { from: [100, 900, 1], g: [10, 100, 10], toSig: 2 },
  { from: [100, 900, 2], g: [5, 50, 5], toSig: 2 },
  { from: [120, 900, 2], g: [10, 60, 1], toSig: 2 },
  { from: [120, 9000, 2], g: [-40, 80, 0.5], toSig: 3 },
  { from: [1100, 90000, 3], g: [-45, 120, 0.5], toSig: 3 },
]

export const percentChange: ExerciseType = {
  id: 'percentChange',
  labelKey: 'type.percentChange',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const from = businessNumber(rng, { min: c.from[0], max: c.from[1], sig: c.from[2] })
    let g = percentLike(rng, { min: c.g[0], max: c.g[1], step: c.g[2] })
    if (Math.abs(g) < 3) g = 5 // une variation quasi nulle n'apprend rien
    const to = roundSig(from * (1 + g / 100), c.toSig)

    const exact = (to / from - 1) * 100
    const delta = to - from

    return build({
      typeId: 'percentChange',
      level,
      prompt: { key: 'q.percentChange.prompt', vars: { from: plain(from), to: plain(to) } },
      path: {
        key: 'q.percentChange.path',
        vars: {
          to: plain(to),
          from: plain(from),
          delta: plain(roundSig(delta, 3)),
          result: pct(roundSig(exact, 3), 1),
        },
      },
      exact,
      answer: { style: 'percent', scale: 'unit' },
      tolerance: ABS(1),
    })
  },
}

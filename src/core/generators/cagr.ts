import { businessNumber, pct, plain, roundSig } from '../numbers'
import { ABS, build, byLevel } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = {
  from: [number, number, number]
  ratio: [number, number]
  y: [number, number]
  toSig: number
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { from: [40, 400, 1], ratio: [2, 2], y: [4, 6], toSig: 2 },
  { from: [40, 400, 2], ratio: [1.5, 2.5], y: [3, 5], toSig: 2 },
  { from: [40, 900, 2], ratio: [1.3, 3], y: [3, 6], toSig: 2 },
  { from: [40, 3000, 2], ratio: [1.1, 5], y: [2, 10], toSig: 3 },
  { from: [40, 5000, 3], ratio: [0.4, 4], y: [3, 10], toSig: 3 },
]

export const cagr: ExerciseType = {
  id: 'cagr',
  labelKey: 'type.cagr',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const from = businessNumber(rng, { min: c.from[0], max: c.from[1], sig: c.from[2] })
    const ratio = c.ratio[0] + rng.next() * (c.ratio[1] - c.ratio[0])
    const y = rng.int(c.y[0], c.y[1])
    let to = roundSig(from * ratio, c.toSig)
    if (to === from) to = roundSig(from * 1.5, c.toSig)

    const exact = (Math.pow(to / from, 1 / y) - 1) * 100

    return build({
      typeId: 'cagr',
      level,
      prompt: {
        key: 'q.cagr.prompt',
        vars: { from: plain(from), to: plain(to), y: plain(y) },
      },
      steps: [
        {
          key: 'q.cagr.s1',
          vars: { from: plain(from), to: plain(to), ratio: plain(roundSig(to / from, 2)) },
        },
        // Ancrage règle de 72 : le taux qui ferait doubler en y années.
        { key: 'q.cagr.s2', vars: { y: plain(y), r72: pct(roundSig(72 / y, 2)) } },
        {
          key:
            to / from > 2.15
              ? 'q.cagr.s3.plus'
              : to / from < 1.85
                ? 'q.cagr.s3.moins'
                : 'q.cagr.s3.environ',
          vars: {
            ratio: plain(roundSig(to / from, 2)),
            r72: pct(roundSig(72 / y, 2)),
            result: pct(roundSig(exact, 3), 1),
          },
        },
      ],
      exact,
      answer: { style: 'percent', scale: 'unit' },
      tolerance: ABS(1),
    })
  },
}

import { businessNumber, pct, percentLike, plain, roundSig, SCALE_FACTOR } from '../numbers'
import { asAnswer, build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = { n: [number, number, number]; p: [number, number, number] }

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { n: [100, 900, 1], p: [10, 90, 10] },
  { n: [200, 900, 2], p: [5, 50, 5] },
  { n: [1000, 9000, 2], p: [5, 45, 1] },
  { n: [1000, 90000, 3], p: [2, 60, 0.5] },
  { n: [10000, 900000, 3], p: [0.5, 80, 0.5] },
]

export const percentOf: ExerciseType = {
  id: 'percentOf',
  labelKey: 'type.percentOf',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const n = businessNumber(rng, { min: c.n[0], max: c.n[1], sig: c.n[2] })
    const p = percentLike(rng, { min: c.p[0], max: c.p[1], step: c.p[2] })

    const { exact, answer } = asAnswer((n * p) / 100, 'plain')
    const f = SCALE_FACTOR[answer.scale]

    // Ancrage sur 10 %, la technique qu'on veut installer.
    const anchor = n / 10
    const mult = roundSig(p / 10, 3)

    return build({
      typeId: 'percentOf',
      level,
      prompt: { key: 'q.percentOf.prompt', vars: { p: pct(p), n: plain(n) } },
      steps: [
        { key: 'q.percentOf.s1', vars: { n: plain(n), anchor: plain(roundSig(anchor, 4)) } },
        { key: 'q.percentOf.s2', vars: { p: pct(p), mult: plain(mult) } },
        {
          key: 'q.percentOf.s3',
          vars: {
            anchor: plain(roundSig(anchor, 4)),
            mult: plain(mult),
            result: plain(roundSig((n * p) / 100 / f, 3), answer.scale),
          },
        },
      ],
      exact,
      answer,
      tolerance: REL(2),
    })
  },
}

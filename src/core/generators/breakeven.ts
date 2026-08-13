import { businessNumber, count, money, percentLike, plain, roundSig, SCALE_FACTOR } from '../numbers'
import { divideTrick } from '../tricks'
import { asAnswer, build, byLevel, maybe, REL } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = {
  /** Coûts fixes, en millions d'euros. */
  fixed: [number, number, number]
  um: [number, number, number]
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { fixed: [1, 9, 1], um: [10, 100, 10] },
  { fixed: [1, 9, 2], um: [5, 50, 5] },
  { fixed: [1, 9, 2], um: [10, 40, 1] },
  { fixed: [0.5, 20, 2], um: [3, 60, 0.5] },
  { fixed: [0.5, 60, 3], um: [1.5, 90, 0.5] },
]

export const breakeven: ExerciseType = {
  id: 'breakeven',
  labelKey: 'type.breakeven',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const fixed = businessNumber(rng, { min: c.fixed[0], max: c.fixed[1], sig: c.fixed[2] })
    const um = percentLike(rng, { min: c.um[0], max: c.um[1], step: c.um[2] })

    const rawUnits = (fixed * 1e6) / um
    const { exact, answer } = asAnswer(rawUnits, 'count')
    const f = SCALE_FACTOR[answer.scale]

    return build({
      typeId: 'breakeven',
      level,
      prompt: {
        key: 'q.breakeven.prompt',
        vars: { fixed: money(fixed, 'M'), um: money(um) },
      },
      steps: [
        { key: 'q.breakeven.s1', vars: { fixedK: plain(roundSig(fixed * 1000, 4), 'k') } },
        { key: 'q.breakeven.s2', vars: { um: money(um) } },
        ...maybe(divideTrick(um)),
        {
          key: 'q.breakeven.s3',
          vars: {
            fixedK: plain(roundSig(fixed * 1000, 4), 'k'),
            um: money(um),
            result: count(roundSig(rawUnits / f, 3), answer.scale),
          },
        },
      ],
      exact,
      answer,
      tolerance: REL(2),
    })
  },
}

import { businessNumber, count, money, plain, roundSig, SCALE_FACTOR } from '../numbers'
import { asAnswer, build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Rng, Scale } from '../types'

type Cfg = {
  /** Montant total : valeur lue + échelle. */
  total: [number, number, number]
  totalScale: Scale
  /** Nombre de clients, en milliers. */
  cust: [number, number, number]
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { total: [100, 900, 1], totalScale: 'M', cust: [100, 900, 1] },
  { total: [100, 900, 2], totalScale: 'M', cust: [50, 900, 2] },
  { total: [1, 9, 2], totalScale: 'Md', cust: [100, 900, 2] },
  { total: [1, 20, 2], totalScale: 'Md', cust: [40, 4000, 2] },
  { total: [0.5, 40, 3], totalScale: 'Md', cust: [30, 9000, 3] },
]

export const perUnit: ExerciseType = {
  id: 'perUnit',
  labelKey: 'type.perUnit',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const total = businessNumber(rng, { min: c.total[0], max: c.total[1], sig: c.total[2] })
    const cust = businessNumber(rng, { min: c.cust[0], max: c.cust[1], sig: c.cust[2] })

    const raw = (total * SCALE_FACTOR[c.totalScale]) / (cust * 1e3)
    const { exact, answer } = asAnswer(raw, 'money')
    const f = SCALE_FACTOR[answer.scale]

    return build({
      typeId: 'perUnit',
      level,
      prompt: {
        key: 'q.perUnit.prompt',
        vars: { total: money(total, c.totalScale), cust: count(cust, 'k') },
      },
      path: {
        key: 'q.perUnit.path',
        vars: {
          total: money(total, c.totalScale),
          cust: count(cust, 'k'),
          // Même magnitude des deux côtés : on ne divise que les mantisses.
          num: plain(roundSig(total * (SCALE_FACTOR[c.totalScale] / 1e6), 4)),
          den: plain(cust),
          result: money(roundSig(raw / f, 3), answer.scale),
        },
      },
      exact,
      answer,
      tolerance: REL(2),
    })
  },
}

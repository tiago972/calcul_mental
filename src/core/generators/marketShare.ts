import { businessNumber, money, pct, percentLike, plain, roundSig } from '../numbers'
import { ABS, build, byLevel } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = {
  market: [number, number, number]
  share: [number, number, number]
  clientSig: number
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { market: [100, 900, 1], share: [10, 50, 5], clientSig: 2 },
  { market: [200, 900, 2], share: [5, 45, 1], clientSig: 2 },
  { market: [400, 950, 2], share: [4, 30, 0.5], clientSig: 2 },
  { market: [150, 980, 3], share: [2, 25, 0.5], clientSig: 3 },
  { market: [120, 990, 3], share: [1, 15, 0.1], clientSig: 3 },
]

export const marketShare: ExerciseType = {
  id: 'marketShare',
  labelKey: 'type.marketShare',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const market = businessNumber(rng, { min: c.market[0], max: c.market[1], sig: c.market[2] })
    const target = percentLike(rng, { min: c.share[0], max: c.share[1], step: c.share[2] })
    const client = roundSig((market * target) / 100, c.clientSig)

    // La réponse se recalcule sur les nombres affichés, pas sur la part visée :
    // sinon l'énoncé et la solution divergent d'un dixième de point.
    const exact = (client / market) * 100

    return build({
      typeId: 'marketShare',
      level,
      prompt: {
        key: 'q.marketShare.prompt',
        vars: { market: money(market, 'M'), client: money(client, 'M') },
      },
      // Ancrage sur 1 % du marché : on compte combien de fois il tient.
      steps: [
        {
          key: 'q.marketShare.s1',
          vars: { market: money(market, 'M'), anchor: money(roundSig(market / 100, 3), 'M') },
        },
        {
          key: 'q.marketShare.s2',
          vars: {
            client: money(client, 'M'),
            anchor: money(roundSig(market / 100, 3), 'M'),
            mult: plain(roundSig(client / (market / 100), 3)),
          },
        },
        { key: 'q.marketShare.s3', vars: { result: pct(roundSig(exact, 3), 1) } },
      ],
      exact,
      answer: { style: 'percent', scale: 'unit' },
      tolerance: ABS(0.5),
    })
  },
}

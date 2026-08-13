import { businessNumber, count, money, pct, percentLike, plain, roundSig, SCALE_FACTOR } from '../numbers'
import { asAnswer, build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = {
  /** Population, en millions. */
  pop: [number, number, number]
  share: [number, number, number]
  freq: [number, number, number]
  price: [number, number, number]
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { pop: [10, 80, 1], share: [10, 50, 10], freq: [1, 1, 1], price: [10, 100, 1] },
  { pop: [10, 90, 2], share: [10, 45, 5], freq: [1, 2, 0.5], price: [5, 100, 2] },
  { pop: [15, 90, 2], share: [8, 40, 1], freq: [1, 3, 0.1], price: [10, 90, 2] },
  { pop: [12, 340, 2], share: [3, 45, 0.5], freq: [0.3, 4, 0.1], price: [8, 400, 2] },
  { pop: [50, 1400, 3], share: [1.5, 40, 0.5], freq: [0.2, 6, 0.1], price: [5, 900, 3] },
]

export const marketSizing: ExerciseType = {
  id: 'marketSizing',
  labelKey: 'type.marketSizing',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const pop = businessNumber(rng, { min: c.pop[0], max: c.pop[1], sig: c.pop[2] })
    const share = percentLike(rng, { min: c.share[0], max: c.share[1], step: c.share[2] })
    const freq = Math.max(c.freq[2], percentLike(rng, { min: c.freq[0], max: c.freq[1], step: c.freq[2] }))
    const price = businessNumber(rng, { min: c.price[0], max: c.price[1], sig: c.price[2] })

    const users = pop * 1e6 * (share / 100)
    const volume = users * freq
    const raw = volume * price

    const { exact, answer } = asAnswer(raw, 'money')
    const f = SCALE_FACTOR[answer.scale]

    return build({
      typeId: 'marketSizing',
      level,
      prompt: {
        key: 'q.marketSizing.prompt',
        vars: {
          pop: count(pop, 'M'),
          share: pct(share),
          freq: plain(freq),
          price: money(price),
        },
      },
      steps: [
        {
          key: 'q.marketSizing.s1',
          vars: {
            pop: count(pop, 'M'),
            share: pct(share),
            users: count(roundSig(users / 1e6, 3), 'M'),
          },
        },
        {
          key: 'q.marketSizing.s2',
          vars: {
            users: count(roundSig(users / 1e6, 3), 'M'),
            freq: plain(freq),
            volume: count(roundSig(volume / 1e6, 3), 'M'),
          },
        },
        {
          key: 'q.marketSizing.s3',
          vars: {
            volume: count(roundSig(volume / 1e6, 3), 'M'),
            price: money(price),
            result: money(roundSig(raw / f, 3), answer.scale),
          },
        },
      ],
      exact,
      answer,
      tolerance: REL(5),
    })
  },
}

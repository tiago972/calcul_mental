import { businessNumber, plain, roundSig, SCALE_FACTOR } from '../numbers'
import { asAnswer, build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

type Cfg = { a: [number, number, number]; b: [number, number, number] }

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { a: [20, 90, 2], b: [10, 90, 1] },
  { a: [200, 900, 2], b: [10, 90, 2] },
  { a: [1000, 9000, 2], b: [100, 900, 2] },
  { a: [1000, 9000, 3], b: [100, 900, 2] },
  { a: [10000, 90000, 3], b: [100, 900, 3] },
]

export const magnitudeProduct: ExerciseType = {
  id: 'magnitudeProduct',
  labelKey: 'type.magnitudeProduct',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const a = businessNumber(rng, { min: c.a[0], max: c.a[1], sig: c.a[2] })
    const b = businessNumber(rng, { min: c.b[0], max: c.b[1], sig: c.b[2] })

    const { exact, answer } = asAnswer(a * b, 'plain')
    const tolerance = REL(2)

    // Le chemin montre l'arrondi à un chiffre significatif, puis le rattrapage.
    const a1 = roundSig(a, 1)
    const b1 = roundSig(b, 1)
    const approx = a1 * b1

    return build({
      typeId: 'magnitudeProduct',
      level,
      prompt: { key: 'q.magnitudeProduct.prompt', vars: { a: plain(a), b: plain(b) } },
      path: {
        key: 'q.magnitudeProduct.path',
        vars: {
          a: plain(a),
          b: plain(b),
          a1: plain(a1),
          b1: plain(b1),
          approx: plain(roundSig(approx / SCALE_FACTOR[answer.scale], 3), answer.scale),
          result: plain(roundSig(exact, 2), answer.scale),
        },
      },
      exact,
      answer,
      tolerance,
    })
  },
}

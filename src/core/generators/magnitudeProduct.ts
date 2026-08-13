import { businessNumber, plain, roundSig, SCALE_FACTOR } from '../numbers'
import { multiplyTrick } from '../tricks'
import { asAnswer, build, byLevel, maybe, REL } from './kit'
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

    // Arrondi de travail : un seul chiffre tant que l'écart reste sous 10 %,
    // deux sinon. À un chiffre, 150 deviendrait 200 — un raccourci qui égare.
    const arrondiUtile = (x: number) => {
      const un = roundSig(x, 1)
      return Math.abs(un - x) / Math.abs(x) <= 0.1 ? un : roundSig(x, 2)
    }
    const a1 = arrondiUtile(a)
    const b1 = arrondiUtile(b)
    const approx = a1 * b1

    // Écrire « 15 ≈ 15 » n'apprend rien : l'étape dit ce qui a vraiment bougé.
    const bougeA = a1 !== a
    const bougeB = b1 !== b
    const cleS1 = bougeA && bougeB ? 's1' : bougeA ? 's1a' : bougeB ? 's1b' : 's1none'

    const calcul = {
      key: 'q.magnitudeProduct.s2',
      vars: {
        a1: plain(a1),
        b1: plain(b1),
        approx: plain(roundSig(approx / SCALE_FACTOR[answer.scale], 3), answer.scale),
      },
    }

    return build({
      typeId: 'magnitudeProduct',
      level,
      prompt: { key: 'q.magnitudeProduct.prompt', vars: { a: plain(a), b: plain(b) } },
      steps: [
        {
          key: `q.magnitudeProduct.${cleS1}`,
          vars: { a: plain(a), b: plain(b), a1: plain(a1), b1: plain(b1) },
        },
        ...maybe(multiplyTrick(a1, b1)),
        calcul,
        // Sans arrondi, le calcul est déjà la réponse : pas d'étape de rattrapage.
        ...(bougeA || bougeB
          ? [
              {
                key: 'q.magnitudeProduct.s3',
                vars: { result: plain(roundSig(exact, 2), answer.scale) },
              },
            ]
          : []),
      ],
      exact,
      answer,
      tolerance,
    })
  },
}

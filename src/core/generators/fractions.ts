import { frac, pct, plain, roundSig } from '../numbers'
import { build, EXACT } from './kit'
import type { ExerciseType, Level, Rng } from '../types'

/** Sens fraction → pourcentage : les dénominateurs peuvent être ingrats. */
const DENS_TO_PCT: readonly (readonly number[])[] = [
  [2, 4, 5, 10],
  [2, 3, 4, 5, 8, 10, 20],
  [3, 6, 7, 8, 9, 12, 16],
  [7, 9, 11, 12, 15, 16, 32],
  [7, 11, 13, 16, 24, 32, 64],
]

/** Sens pourcentage → fraction : seulement ce qui se retrouve de tête. */
const DENS_TO_FRAC: readonly (readonly number[])[] = [
  [2, 4, 5, 10],
  [2, 4, 5, 8, 10, 20],
  [3, 6, 8, 16],
  [3, 6, 8, 12, 16, 25],
  [7, 9, 12, 16, 32],
]

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/** Numérateur premier avec `d` : la fraction est toujours affichée irréductible. */
function drawNumerator(rng: Rng, d: number): number {
  const candidates: number[] = []
  for (let n = 1; n < d; n++) if (gcd(n, d) === 1) candidates.push(n)
  return rng.pick(candidates)
}

export const fractions: ExerciseType = {
  id: 'fractions',
  labelKey: 'type.fractions',
  generate(level: Level, rng: Rng) {
    const toPct = rng.next() < 0.5
    const dens = (toPct ? DENS_TO_PCT : DENS_TO_FRAC)[level - 1]
    const d = rng.pick(dens)
    const n = drawNumerator(rng, d)

    const value = n / d
    const unit = roundSig(100 / d, 5)

    if (toPct) {
      const exact = value * 100
      return build({
        typeId: 'fractions',
        level,
        prompt: { key: 'q.fractions.promptToPct', vars: { f: frac(n, d) } },
        path: {
          key: 'q.fractions.pathToPct',
          vars: {
            f: frac(n, d),
            n: plain(n),
            unit: pct(unit),
            result: pct(roundSig(exact, 4), 1),
          },
        },
        exact,
        answer: { style: 'percent', scale: 'unit' },
        tolerance: EXACT(1),
      })
    }

    return build({
      typeId: 'fractions',
      level,
      prompt: {
        key: 'q.fractions.promptToFrac',
        vars: { p: pct(roundSig(value * 100, 4)) },
      },
      path: {
        key: 'q.fractions.pathToFrac',
        vars: {
          d: plain(d),
          unit: pct(unit),
          p: pct(roundSig(value * 100, 4)),
          result: frac(n, d),
        },
      },
      exact: value,
      // Le retour affiche « 5/8 », pas 0,625.
      answerDisplay: frac(n, d),
      answer: { style: 'fraction', scale: 'unit' },
      tolerance: EXACT(3),
    })
  },
}

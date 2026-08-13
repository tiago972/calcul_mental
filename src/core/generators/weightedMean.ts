import { businessNumber, money, pct, roundSig } from '../numbers'
import { build, byLevel, REL } from './kit'
import type { ExerciseType, Level, Num, Rng } from '../types'

type Cfg = {
  segments: number
  /** Pas de la grille des poids, en points. */
  wStep: number
  price: [number, number, number]
}

const CFG: readonly [Cfg, Cfg, Cfg, Cfg, Cfg] = [
  { segments: 2, wStep: 10, price: [5, 40, 1] },
  { segments: 2, wStep: 5, price: [5, 60, 2] },
  { segments: 3, wStep: 5, price: [8, 40, 2] },
  { segments: 3, wStep: 5, price: [10, 250, 2] },
  { segments: 4, wStep: 5, price: [10, 900, 3] },
]

/** Poids entiers sur la grille, de somme 100, aucun segment vide. */
function drawWeights(rng: Rng, n: number, step: number): number[] {
  const slots = 100 / step
  for (let attempt = 0; attempt < 64; attempt++) {
    const cuts: number[] = []
    for (let i = 0; i < n - 1; i++) cuts.push(rng.int(1, slots - 1))
    cuts.sort((a, b) => a - b)
    const bounds = [0, ...cuts, slots]
    const w = bounds.slice(1).map((b, i) => (b - bounds[i]) * step)
    if (w.every((x) => x >= step * 2)) return w
  }
  const even = Math.round(100 / n / step) * step
  const w = Array.from({ length: n }, () => even)
  w[0] += 100 - w.reduce((a, b) => a + b, 0)
  return w
}

export const weightedMean: ExerciseType = {
  id: 'weightedMean',
  labelKey: 'type.weightedMean',
  generate(level: Level, rng: Rng) {
    const c = byLevel(level, CFG)
    const w = drawWeights(rng, c.segments, c.wStep)
    const p = w.map(() =>
      businessNumber(rng, { min: c.price[0], max: c.price[1], sig: c.price[2] }),
    )

    const exact = w.reduce((acc, wi, i) => acc + (wi * p[i]) / 100, 0)

    const vars: Record<string, Num> = {}
    w.forEach((wi, i) => {
      vars[`w${i + 1}`] = pct(wi)
      vars[`p${i + 1}`] = money(p[i])
      vars[`c${i + 1}`] = money(roundSig((wi * p[i]) / 100, 3))
    })
    vars.result = money(roundSig(exact, 3))

    return build({
      typeId: 'weightedMean',
      level,
      prompt: { key: `q.weightedMean.prompt${c.segments}`, vars },
      steps: [
        { key: 'q.weightedMean.s1', vars: { w1: vars.w1, p1: vars.p1, c1: vars.c1 } },
        { key: `q.weightedMean.s2_${c.segments}`, vars },
        { key: 'q.weightedMean.s3', vars: { result: vars.result } },
      ],
      exact,
      answer: { style: 'money', scale: 'unit' },
      tolerance: REL(2),
    })
  },
}

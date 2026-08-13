import { describe, expect, it } from 'vitest'
import { FLOOR, pickType, recentRates, weights } from '@/core/sampling'
import { makeRng } from '@/core/rng'
import { TYPE_IDS } from '@/core/types'
import type { Rates } from '@/core/sampling'
import type { Attempt, TypeId } from '@/core/types'

const allSeen = (rate: number): Rates =>
  Object.fromEntries(TYPE_IDS.map((id) => [id, rate])) as Rates

const attempt = (typeId: TypeId, correct: boolean, ts = 0): Attempt => ({
  ts,
  typeId,
  level: 1,
  ms: 10_000,
  correct,
  given: 1,
})

describe('taux récents', () => {
  it('null pour un type jamais vu', () => {
    const r = recentRates([attempt('cagr', true)])
    expect(r.cagr).toBe(1)
    expect(r.margin).toBeNull()
  })

  it('ne regarde que la fenêtre glissante', () => {
    const old = Array.from({ length: 30 }, (_, i) => attempt('cagr', false, i))
    const recent = Array.from({ length: 30 }, (_, i) => attempt('cagr', true, 100 + i))
    expect(recentRates([...old, ...recent], 30).cagr).toBe(1)
    expect(recentRates([...old, ...recent], 60).cagr).toBe(0.5)
  })
})

describe('poids', () => {
  it('somment exactement à 1', () => {
    for (const rates of [allSeen(0), allSeen(1), allSeen(0.5)]) {
      const w = weights(rates)
      const sum = TYPE_IDS.reduce((a, id) => a + w[id], 0)
      expect(sum).toBeCloseTo(1, 12)
    }
  })

  it('respectent le plancher, y compris pour un type parfaitement maîtrisé', () => {
    const rates = allSeen(0.4)
    rates.fractions = 1
    const w = weights(rates)
    for (const id of TYPE_IDS) expect(w[id]).toBeGreaterThanOrEqual(FLOOR - 1e-12)
  })

  it('surpondèrent le type le plus faible', () => {
    const rates = allSeen(0.9)
    rates.cagr = 0.2
    const w = weights(rates)
    for (const id of TYPE_IDS) if (id !== 'cagr') expect(w.cagr).toBeGreaterThan(w[id])
  })

  it('donnent la priorité à un type jamais rencontré', () => {
    const rates = allSeen(0.5)
    rates.marketSizing = null
    const w = weights(rates)
    for (const id of TYPE_IDS) if (id !== 'marketSizing') expect(w.marketSizing).toBeGreaterThan(w[id])
  })

  it('restent uniformes quand tous les types se valent', () => {
    const w = weights(allSeen(0.6))
    const vals = TYPE_IDS.map((id) => w[id])
    for (const v of vals) expect(v).toBeCloseTo(1 / TYPE_IDS.length, 12)
  })

  it('le plancher demandé de 10 % serait impossible à douze types', () => {
    expect(TYPE_IDS.length * 0.1).toBeGreaterThan(1)
    expect(TYPE_IDS.length * FLOOR).toBeLessThan(1)
  })
})

describe('tirage', () => {
  it('respecte la loi à la longue', () => {
    const rates = allSeen(0.9)
    rates.cagr = 0
    const w = weights(rates)
    const rng = makeRng(3)
    const counts = {} as Record<TypeId, number>
    for (const id of TYPE_IDS) counts[id] = 0
    const N = 60_000
    for (let i = 0; i < N; i++) counts[pickType(w, rng)]++

    for (const id of TYPE_IDS) {
      expect(counts[id] / N).toBeCloseTo(w[id], 2)
      expect(counts[id] / N).toBeGreaterThan(FLOOR * 0.8)
    }
  })

  it('est déterministe à graine égale', () => {
    const w = weights(allSeen(0.5))
    const a = makeRng(11)
    const b = makeRng(11)
    for (let i = 0; i < 50; i++) expect(pickType(w, a)).toBe(pickType(w, b))
  })
})

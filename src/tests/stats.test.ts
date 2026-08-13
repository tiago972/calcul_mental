import { describe, expect, it } from 'vitest'
import { byType, dayKey, DAY_MS, median, shiftDay, streak, trend30, weakest } from '@/core/stats'
import { advise, initialLevels, outcome } from '@/core/session'
import type { Attempt, TypeId } from '@/core/types'

const at = (typeId: TypeId, ms: number, correct: boolean, ts: number): Attempt => ({
  ts,
  typeId,
  level: 2,
  ms,
  correct,
  given: 1,
})

describe('médiane', () => {
  it('effectifs pairs et impairs', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 2, 3])).toBe(2.5)
    expect(median([7])).toBe(7)
    expect(median([])).toBeNull()
  })
})

describe('jours', () => {
  it('décale sans se tromper de mois ni d’année', () => {
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28')
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31')
    expect(shiftDay('2024-02-28', 1)).toBe('2024-02-29')
  })

  it('la clé de jour suit l’heure locale', () => {
    const noon = new Date(2026, 7, 12, 12, 0, 0).getTime()
    expect(dayKey(noon)).toBe('2026-08-12')
    expect(dayKey(noon + 11 * 3600_000)).toBe('2026-08-12')
    expect(dayKey(noon + 13 * 3600_000)).toBe('2026-08-13')
  })
})

describe('série de jours', () => {
  const today = '2026-08-12'

  it('compte les jours consécutifs', () => {
    expect(streak(['2026-08-10', '2026-08-11', '2026-08-12'], today)).toBe(3)
  })

  it('survit à la journée en cours non encore travaillée', () => {
    expect(streak(['2026-08-10', '2026-08-11'], today)).toBe(2)
  })

  it('tombe à zéro après deux jours manqués', () => {
    expect(streak(['2026-08-09', '2026-08-10'], today)).toBe(0)
  })

  it('s’arrête au premier trou', () => {
    expect(streak(['2026-08-01', '2026-08-10', '2026-08-11', '2026-08-12'], today)).toBe(3)
  })

  it('ignore les doublons et le désordre', () => {
    expect(streak(['2026-08-12', '2026-08-11', '2026-08-12'], today)).toBe(2)
  })

  it('vide', () => {
    expect(streak([], today)).toBe(0)
  })
})

describe('tendance 30 jours', () => {
  const now = 1_800_000_000_000

  it('null si l’une des deux fenêtres est trop maigre', () => {
    const a = Array.from({ length: 10 }, (_, i) => at('cagr', 10_000, true, now - i * 1000))
    expect(trend30(a, 'cagr', now)).toBeNull()
  })

  it('négative quand on accélère', () => {
    const before = Array.from({ length: 10 }, () => at('cagr', 20_000, true, now - 45 * DAY_MS))
    const recent = Array.from({ length: 10 }, () => at('cagr', 12_000, true, now - 5 * DAY_MS))
    expect(trend30([...before, ...recent], 'cagr', now)).toBe(-8_000)
  })
})

describe('tableau par type', () => {
  const now = 1_800_000_000_000
  const attempts = [
    at('cagr', 30_000, false, now - 1000),
    at('cagr', 28_000, false, now - 2000),
    at('cagr', 26_000, true, now - 3000),
    at('margin', 8_000, true, now - 4000),
    at('margin', 9_000, true, now - 5000),
    at('margin', 10_000, true, now - 6000),
  ]

  it('agrège réussite, médiane et niveau', () => {
    const rows = byType(attempts, initialLevels(), now)
    const cagr = rows.find((r) => r.typeId === 'cagr')!
    expect(cagr.n).toBe(3)
    expect(cagr.rate).toBeCloseTo(1 / 3, 10)
    expect(cagr.medianMs).toBe(28_000)
    expect(cagr.level).toBe(1)

    const unseen = rows.find((r) => r.typeId === 'fractions')!
    expect(unseen.n).toBe(0)
    expect(unseen.rate).toBeNull()
    expect(unseen.medianMs).toBeNull()
  })

  it('désigne les types les plus faibles', () => {
    const rows = byType(attempts, initialLevels(), now)
    expect(weakest(rows, 1)[0].typeId).toBe('cagr')
  })
})

describe('bilan de séance', () => {
  const now = 1_800_000_000_000
  const T = 20_000

  it('mesure la part de réponses justes mais hors délai', () => {
    const a = [
      at('cagr', 25_000, true, now),
      at('cagr', 30_000, true, now),
      at('cagr', 10_000, true, now),
      at('cagr', 12_000, true, now),
    ]
    expect(outcome(a, T).lateShare).toBe(0.5)
    expect(outcome(a, T).rate).toBe(1)
  })

  it('séance vide', () => {
    expect(outcome([], T)).toEqual({ n: 0, medianMs: null, rate: null, lateShare: 0 })
  })
})

describe('conseil du lendemain', () => {
  const now = 1_800_000_000_000
  const T = 20_000
  const many = (ms: number, correct: boolean, n = 10) =>
    Array.from({ length: n }, () => at('cagr', ms, correct, now))

  it('trop court pour conclure', () => {
    expect(advise(many(10_000, true, 3), T).key).toBe('advice.empty')
  })

  it('juste mais lent', () => {
    expect(advise(many(26_000, true), T).key).toBe('advice.slow')
  })

  it('rapide mais imprécis', () => {
    expect(advise(many(9_000, false), T).key).toBe('advice.rushed')
  })

  it('désigne le type faible quand tout le reste va bien', () => {
    const a = [...many(9_000, true, 11), at('cagr', 9_000, false, now), at('cagr', 9_000, false, now)]
    const r = advise(a, T, 'margin')
    expect(r.key).toBe('advice.weakType')
    expect(r.typeId).toBe('margin')
  })

  it('rien à corriger', () => {
    expect(advise(many(9_000, true), T, 'margin').key).toBe('advice.good')
  })
})

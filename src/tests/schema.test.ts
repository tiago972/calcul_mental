import { describe, expect, it } from 'vitest'
import { defaultState, parseState, serialize } from '@/store/schema'
import { reducer } from '@/store/useApp'
import { TYPE_IDS } from '@/core/types'
import type { Attempt } from '@/core/types'

const attempt = (over: Partial<Attempt> = {}): Attempt => ({
  ts: 1_800_000_000_000,
  typeId: 'cagr',
  level: 3,
  ms: 12_000,
  correct: true,
  given: 14,
  ...over,
})

describe('export / import', () => {
  it('fait l’aller-retour sans perte', () => {
    const s = defaultState()
    s.attempts = [attempt(), attempt({ correct: false, given: null })]
    s.days = ['2026-08-11', '2026-08-12']
    s.sessions = [{ ts: 1, n: 2, medianMs: 12_000, rate: 0.5 }]
    s.levels.cagr = { level: 4, goodStreak: 2, failStreak: 0 }

    expect(parseState(JSON.parse(serialize(s)))).toEqual(s)
  })
})

describe('résistance aux données abîmées', () => {
  it('refuse ce qui n’est pas un objet', () => {
    expect(parseState(null)).toBeNull()
    expect(parseState('bonjour')).toBeNull()
    expect(parseState([1, 2, 3])).toBeNull()
  })

  it('retombe sur les valeurs par défaut, champ par champ', () => {
    const s = parseState({
      settings: { lang: 'klingon', targetMs: -5, feedbackMs: 'plus tard' },
      levels: 'nope',
    })!
    expect(['fr', 'en']).toContain(s.settings.lang)
    expect(s.settings.targetMs).toBe(defaultState().settings.targetMs)
    expect(s.settings.feedbackMs).toBe(defaultState().settings.feedbackMs)
    for (const id of TYPE_IDS) expect(s.levels[id].level).toBe(1)
  })

  it('accepte 0 pour la lecture de correction : c’est le mode « au tap »', () => {
    expect(parseState({ settings: { feedbackMs: 0 } })!.settings.feedbackMs).toBe(0)
  })

  it('écarte les tentatives incomplètes ou d’un type inconnu', () => {
    const s = parseState({
      attempts: [
        attempt(),
        { ts: 1, typeId: 'licorne', ms: 1, correct: true },
        { ts: 2, ms: 'plus tard', correct: true, typeId: 'cagr' },
        null,
      ],
    })!
    expect(s.attempts).toHaveLength(1)
    expect(s.attempts[0].typeId).toBe('cagr')
  })

  it('borne les niveaux venus d’ailleurs', () => {
    const s = parseState({ levels: { cagr: { level: 99 }, margin: { level: -3 } } })!
    expect(s.levels.cagr.level).toBe(5)
    expect(s.levels.margin.level).toBe(1)
  })

  it('nettoie et dédoublonne les jours', () => {
    const s = parseState({ days: ['2026-08-12', '2026-08-12', 'hier', 42, '2026-08-11'] })!
    expect(s.days).toEqual(['2026-08-11', '2026-08-12'])
  })
})

describe('réducteur', () => {
  it('enregistre la tentative et fait évoluer le niveau du bon type', () => {
    let s = defaultState()
    s = { ...s, levels: { ...s.levels, cagr: { level: 2, goodStreak: 3, failStreak: 0 } } }
    s = reducer(s, { type: 'record', attempt: attempt({ ms: 5_000 }) })

    expect(s.attempts).toHaveLength(1)
    expect(s.levels.cagr.level).toBe(3)
    expect(s.levels.margin.level).toBe(1)
  })

  it('une séance vide n’entame pas la série', () => {
    const s = defaultState()
    expect(reducer(s, { type: 'endSession', ts: Date.now(), n: 0, medianMs: null, rate: null })).toBe(s)
  })

  it('un même jour ne compte qu’une fois', () => {
    let s = defaultState()
    const ts = new Date(2026, 7, 12, 9).getTime()
    s = reducer(s, { type: 'endSession', ts, n: 5, medianMs: 1, rate: 1 })
    s = reducer(s, { type: 'endSession', ts: ts + 3600_000, n: 5, medianMs: 1, rate: 1 })
    expect(s.days).toEqual(['2026-08-12'])
    expect(s.sessions).toHaveLength(2)
  })

  it('la remise à zéro garde les réglages', () => {
    let s = defaultState()
    s = reducer(s, { type: 'settings', patch: { lang: 'en', targetMs: 30_000 } })
    s = reducer(s, { type: 'record', attempt: attempt() })
    s = reducer(s, { type: 'reset' })
    expect(s.attempts).toHaveLength(0)
    expect(s.settings.lang).toBe('en')
    expect(s.settings.targetMs).toBe(30_000)
  })
})

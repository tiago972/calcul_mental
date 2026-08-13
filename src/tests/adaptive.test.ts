import { describe, expect, it } from 'vitest'
import { DOWN_AFTER, initialTypeState, isSuccess, nextLevel, UP_AFTER } from '@/core/adaptive'
import type { TypeState } from '@/core/types'

const T = 20_000
const fast = { correct: true, ms: 12_000, targetMs: T }
const slow = { correct: true, ms: 25_000, targetMs: T }
const wrong = { correct: false, ms: 9_000, targetMs: T }

const run = (s: TypeState, rs: (typeof fast)[]) => rs.reduce(nextLevel, s)

describe('succès', () => {
  it('juste et dans les temps seulement', () => {
    expect(isSuccess(fast)).toBe(true)
    expect(isSuccess(slow)).toBe(false)
    expect(isSuccess(wrong)).toBe(false)
    expect(isSuccess({ correct: true, ms: T, targetMs: T })).toBe(true)
  })
})

describe('montée de niveau', () => {
  it('monte après quatre bonnes réponses rapides consécutives', () => {
    const s = run(initialTypeState(2), Array(UP_AFTER).fill(fast))
    expect(s.level).toBe(3)
  })

  it('ne monte pas à trois', () => {
    const s = run(initialTypeState(2), Array(UP_AFTER - 1).fill(fast))
    expect(s.level).toBe(2)
    expect(s.goodStreak).toBe(3)
  })

  it('ne monte pas si les bonnes réponses sont hors délai', () => {
    const s = run(initialTypeState(2), Array(8).fill(slow))
    expect(s.level).toBeLessThan(2)
  })

  it('une erreur casse la série', () => {
    const s = run(initialTypeState(2), [fast, fast, fast, wrong, fast, fast, fast])
    expect(s.level).toBe(2)
  })

  it('plafonne à 5', () => {
    const s = run(initialTypeState(5), Array(20).fill(fast))
    expect(s.level).toBe(5)
  })
})

describe('descente de niveau', () => {
  it('descend après deux échecs consécutifs', () => {
    const s = run(initialTypeState(4), Array(DOWN_AFTER).fill(wrong))
    expect(s.level).toBe(3)
  })

  it('un dépassement de chrono compte comme un échec', () => {
    const s = run(initialTypeState(4), [slow, slow])
    expect(s.level).toBe(3)
  })

  it('une bonne réponse au milieu annule la descente', () => {
    const s = run(initialTypeState(4), [wrong, fast, wrong])
    expect(s.level).toBe(4)
  })

  it('plancher à 1', () => {
    const s = run(initialTypeState(1), Array(20).fill(wrong))
    expect(s.level).toBe(1)
  })
})

describe('compteurs', () => {
  it('remis à zéro à chaque changement de niveau, pour éviter l’oscillation', () => {
    const up = run(initialTypeState(2), Array(UP_AFTER).fill(fast))
    expect(up).toEqual({ level: 3, goodStreak: 0, failStreak: 0 })

    const down = run(initialTypeState(2), Array(DOWN_AFTER).fill(wrong))
    expect(down).toEqual({ level: 1, goodStreak: 0, failStreak: 0 })
  })

  it('ne descend pas immédiatement après être monté', () => {
    let s = run(initialTypeState(2), Array(UP_AFTER).fill(fast))
    s = nextLevel(s, wrong)
    expect(s.level).toBe(3)
    expect(s.failStreak).toBe(1)
  })
})

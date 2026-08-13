import { describe, expect, it } from 'vitest'
import { check, roundestWithin, tolerated } from '@/core/tolerance'
import type { Question, Tolerance } from '@/core/types'

const q = (exact: number, tolerance: Tolerance): Question => ({
  typeId: 'magnitudeProduct',
  level: 3,
  prompt: { key: 'x', vars: {} },
  path: { key: 'x', vars: {} },
  exact,
  rounded: exact,
  answer: { style: 'plain', scale: 'unit' },
  tolerance,
})

describe('largeur de la bande', () => {
  it('relative, absolue, exacte', () => {
    expect(tolerated(1000, { kind: 'rel', pct: 2 })).toBe(20)
    expect(tolerated(-1000, { kind: 'rel', pct: 2 })).toBe(20)
    expect(tolerated(1000, { kind: 'abs', delta: 0.5 })).toBe(0.5)
    expect(tolerated(1000, { kind: 'exact', d: 1 })).toBeCloseTo(0.05, 10)
  })
})

describe('check', () => {
  it('accepte la borne pile et refuse juste au-delà', () => {
    const target = q(1000, { kind: 'rel', pct: 2 })
    expect(check(1020, target).ok).toBe(true)
    expect(check(980, target).ok).toBe(true)
    expect(check(1020.1, target).ok).toBe(false)
    expect(check(979.9, target).ok).toBe(false)
  })

  it('tolérance absolue en points', () => {
    const target = q(11.5, { kind: 'abs', delta: 0.5 })
    expect(check(12, target).ok).toBe(true)
    expect(check(11, target).ok).toBe(true)
    expect(check(12.01, target).ok).toBe(false)
  })

  it('tolérance exacte à la décimale près', () => {
    const target = q(37.5, { kind: 'exact', d: 1 })
    expect(check(37.5, target).ok).toBe(true)
    expect(check(37.54, target).ok).toBe(true)
    expect(check(37.6, target).ok).toBe(false)
  })

  it('reporte l’écart signé dans la bonne unité', () => {
    const rel = check(1050, q(1000, { kind: 'rel', pct: 2 }))
    expect(rel.errorUnit).toBe('pct')
    expect(rel.error).toBeCloseTo(5, 10)

    const abs = check(10, q(11.5, { kind: 'abs', delta: 0.5 }))
    expect(abs.errorUnit).toBe('pt')
    expect(abs.error).toBeCloseTo(-1.5, 10)
  })
})

describe('roundestWithin', () => {
  it('donne le nombre le plus rond encore acceptable', () => {
    expect(roundestWithin(1.596, { kind: 'rel', pct: 2 })).toBe(1.6)
    expect(roundestWithin(612, { kind: 'rel', pct: 2 })).toBe(600)
    // À 1,0499 un seul chiffre significatif dépasserait 2 % : il en faut trois.
    expect(roundestWithin(1.0499, { kind: 'rel', pct: 2 })).toBe(1.05)
  })

  it('reste toujours dans la tolérance', () => {
    const tols: Tolerance[] = [
      { kind: 'rel', pct: 2 },
      { kind: 'rel', pct: 3 },
      { kind: 'rel', pct: 5 },
      { kind: 'abs', delta: 0.5 },
      { kind: 'abs', delta: 1 },
    ]
    for (const tol of tols) {
      for (let i = 0; i < 3000; i++) {
        const exact = (Math.random() - 0.3) * 10 ** (i % 7)
        if (exact === 0) continue
        const r = roundestWithin(exact, tol)
        expect(check(r, q(exact, tol)).ok).toBe(true)
      }
    }
  })

  it('arrondit simplement quand la tolérance est exacte', () => {
    expect(roundestWithin(14.2857, { kind: 'exact', d: 1 })).toBe(14.3)
    expect(roundestWithin(0.625, { kind: 'exact', d: 3 })).toBe(0.625)
  })
})

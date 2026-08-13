import { describe, expect, it } from 'vitest'
import { makeRng } from '@/core/rng'
import { businessNumber, percentLike, pickScale, roundSig, sigDigits, toScale } from '@/core/numbers'

describe('roundSig', () => {
  it('arrondit au nombre de chiffres significatifs demandé', () => {
    expect(roundSig(4237, 2)).toBe(4200)
    expect(roundSig(4237, 3)).toBe(4240)
    expect(roundSig(0.0004237, 2)).toBeCloseTo(0.00042, 10)
    expect(roundSig(-1596, 2)).toBe(-1600)
  })

  it('laisse passer 0 et les non-finis', () => {
    expect(roundSig(0, 3)).toBe(0)
    expect(roundSig(Infinity, 3)).toBe(Infinity)
  })
})

describe('sigDigits', () => {
  it('compte les chiffres réellement portés', () => {
    expect(sigDigits(4200)).toBe(2)
    expect(sigDigits(4000)).toBe(1)
    expect(sigDigits(4237)).toBe(4)
    expect(sigDigits(12.5)).toBe(3)
  })
})

describe('businessNumber', () => {
  const rng = makeRng(1)

  it('reste dans la plage demandée', () => {
    for (let i = 0; i < 2000; i++) {
      const v = businessNumber(rng, { min: 1000, max: 9000, sig: 2 })
      expect(v).toBeGreaterThanOrEqual(1000)
      expect(v).toBeLessThanOrEqual(9000)
    }
  })

  it('respecte le nombre de chiffres significatifs', () => {
    for (let i = 0; i < 2000; i++) {
      const v = businessNumber(rng, { min: 1000, max: 9000, sig: 2 })
      expect(roundSig(v, 2)).toBe(v)
    }
  })

  it('évite le dernier chiffre significatif nul quand on le lui demande', () => {
    let round = 0
    for (let i = 0; i < 500; i++) {
      const v = businessNumber(rng, { min: 1000, max: 9000, sig: 2, avoidRound: true })
      if (sigDigits(v) < 2) round++
    }
    expect(round).toBe(0)
  })

  it('est déterministe à graine égale', () => {
    const a = makeRng(42)
    const b = makeRng(42)
    const draw = (r: typeof a) => businessNumber(r, { min: 100, max: 900, sig: 2 })
    expect([draw(a), draw(a), draw(a)]).toEqual([draw(b), draw(b), draw(b)])
  })
})

describe('percentLike', () => {
  it('tombe sur la grille et dans les bornes', () => {
    const rng = makeRng(7)
    for (let i = 0; i < 1000; i++) {
      const v = percentLike(rng, { min: 5, max: 45, step: 0.5 })
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThanOrEqual(45)
      expect(Math.round(v * 2) / 2).toBeCloseTo(v, 10)
    }
  })
})

describe('échelles', () => {
  it('choisit l’échelle de lecture', () => {
    expect(pickScale(612)).toBe('unit')
    expect(pickScale(1200)).toBe('k')
    expect(pickScale(1_596_000)).toBe('M')
    expect(pickScale(2_400_000_000)).toBe('Md')
    expect(pickScale(-2_400_000_000)).toBe('Md')
  })

  it('ramène la valeur dans son échelle', () => {
    expect(toScale(1_596_000)).toEqual({ v: 1.596, scale: 'M' })
    expect(toScale(1_596_000, 'k')).toEqual({ v: 1596, scale: 'k' })
  })
})

import { describe, expect, it } from 'vitest'
import { divideTrick, mantissa, multiplyTrick, percentTrick } from '@/core/tricks'
import { DICT, LANGS, tPhrase } from '@/i18n'

describe('mantisse', () => {
  it('sépare le chiffre significatif de la puissance de dix', () => {
    expect(mantissa(250)).toEqual({ m: 25, p: 10 })
    expect(mantissa(9)).toEqual({ m: 9, p: 1 })
    expect(mantissa(5000)).toEqual({ m: 5, p: 1000 })
    expect(mantissa(37)).toEqual({ m: 37, p: 1 })
  })

  it('laisse les non-entiers tranquilles', () => {
    expect(mantissa(12.5)).toEqual({ m: 12.5, p: 1 })
    expect(mantissa(0)).toEqual({ m: 0, p: 1 })
  })
})

describe('raccourcis de multiplication', () => {
  it('reconnaît les facteurs classiques, à toute échelle', () => {
    expect(multiplyTrick(37, 5)?.key).toBe('trick.mult.5')
    expect(multiplyTrick(37, 500)?.key).toBe('trick.mult.5')
    expect(multiplyTrick(900, 37)?.key).toBe('trick.mult.9')
    expect(multiplyTrick(37, 25)?.key).toBe('trick.mult.25')
    expect(multiplyTrick(37, 110)?.key).toBe('trick.mult.11')
    expect(multiplyTrick(37, 150)?.key).toBe('trick.mult.15')
  })

  it('ne propose rien sur des facteurs quelconques', () => {
    expect(multiplyTrick(37, 38)).toBeNull()
    expect(multiplyTrick(4200, 380)).toBeNull()
  })

  /**
   * Le point qui compte : la décomposition annoncée doit redonner exactement le
   * facteur. Un raccourci faux apprendrait une erreur.
   */
  it('chaque décomposition annoncée est une identité exacte', () => {
    const verifie: Record<string, (f: number, x: number, u: number) => number> = {
      'trick.mult.5': (_f, x) => x / 2,
      'trick.mult.9': (_f, x, u) => x - u,
      'trick.mult.11': (_f, x, u) => x + u,
      'trick.mult.12': (_f, x, u) => x + u,
      'trick.mult.15': (_f, x) => x + x / 2,
      'trick.mult.25': (_f, x) => x / 4,
    }
    const vus = new Set<string>()
    for (let b = 1; b <= 5000; b++) {
      const tr = multiplyTrick(7, b)
      if (!tr) continue
      vus.add(tr.key)
      const f = tr.vars.f.v
      const x = tr.vars.x.v
      const u = tr.vars.u?.v ?? 0
      expect(verifie[tr.key](f, x, u), `${tr.key} sur ${b}`).toBeCloseTo(f, 9)
    }
    // Tous les raccourcis déclarés doivent avoir été rencontrés au moins une fois.
    expect([...vus].sort()).toEqual(Object.keys(verifie).sort())
  })
})

describe('raccourcis de division', () => {
  it('reconnaît les diviseurs classiques', () => {
    expect(divideTrick(5)?.key).toBe('trick.div.5')
    expect(divideTrick(50)?.key).toBe('trick.div.5')
    expect(divideTrick(25)?.key).toBe('trick.div.25')
    expect(divideTrick(2)?.key).toBe('trick.div.2')
    expect(divideTrick(4)?.key).toBe('trick.div.4')
    expect(divideTrick(37)).toBeNull()
  })

  it('« ×2 puis /x » et « ×4 puis /x » sont exacts', () => {
    for (let d = 1; d <= 5000; d++) {
      const tr = divideTrick(d)
      if (!tr?.vars.x) continue
      const facteur = tr.key === 'trick.div.5' ? 2 : 4
      // Diviser par d équivaut à multiplier par `facteur` puis diviser par x.
      expect(facteur / tr.vars.x.v, `${tr.key} sur ${d}`).toBeCloseTo(1 / d, 12)
    }
  })
})

describe('raccourcis de pourcentage', () => {
  it('ne retient que des fractions exactes', () => {
    expect(percentTrick(25)?.key).toBe('trick.pct.quarter')
    expect(percentTrick(12.5)?.key).toBe('trick.pct.eighth')
    expect(percentTrick(50)?.key).toBe('trick.pct.half')
    // 33 % n'est pas un tiers : l'annoncer comme tel apprendrait une erreur.
    expect(percentTrick(33)).toBeNull()
    expect(percentTrick(18)).toBeNull()
  })
})

describe('libellés', () => {
  it('toutes les clés de raccourci existent dans les deux langues et se rendent', () => {
    const phrases = [
      ...Array.from({ length: 3000 }, (_, i) => multiplyTrick(7, i + 1)),
      ...Array.from({ length: 3000 }, (_, i) => divideTrick(i + 1)),
      ...[5, 12.5, 15, 20, 25, 50, 75, 90, 95].map(percentTrick),
    ].filter((p): p is NonNullable<typeof p> => p !== null)

    expect(phrases.length).toBeGreaterThan(30)
    for (const ph of phrases) {
      for (const lang of LANGS) {
        expect(DICT[lang], `${ph.key} manquante en ${lang}`).toHaveProperty(ph.key)
        expect(tPhrase(ph, lang)).not.toMatch(/[{}]/)
      }
    }
  })
})

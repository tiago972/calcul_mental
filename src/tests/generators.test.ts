import { describe, expect, it } from 'vitest'
import { registryIsConsistent, TYPES } from '@/core/generators'
import { makeRng } from '@/core/rng'
import { check } from '@/core/tolerance'
import { sigDigits } from '@/core/numbers'
import { DICT, LANGS, tPhrase } from '@/i18n'
import { LEVELS, TYPE_IDS } from '@/core/types'
import type { Level, Phrase, Question } from '@/core/types'

const DRAWS = 400

/** Toutes les questions d'un type à un niveau, sur une graine fixe. */
function sample(typeIndex: number, level: Level): Question[] {
  const rng = makeRng(1000 * typeIndex + level)
  return Array.from({ length: DRAWS }, () => TYPES[typeIndex].generate(level, rng))
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1])

describe('registre', () => {
  it('couvre exactement TYPE_IDS', () => {
    expect(registryIsConsistent()).toBe(true)
    expect(TYPES.map((t) => t.id)).toEqual([...TYPE_IDS])
  })
})

describe.each(TYPES.map((t, i) => [t.id, i] as const))('générateur %s', (id, i) => {
  it('produit une question saine à chaque niveau', () => {
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        expect(q.typeId).toBe(id)
        expect(q.level).toBe(level)
        expect(Number.isFinite(q.exact)).toBe(true)
        expect(Number.isFinite(q.rounded)).toBe(true)
        expect(q.exact).not.toBe(0)
      }
    }
  })

  it('la réponse arrondie tombe toujours dans la tolérance', () => {
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        expect(check(q.rounded, q).ok).toBe(true)
        expect(check(q.exact, q).ok).toBe(true)
      }
    }
  })

  it('la réponse arrondie est plus ronde que la valeur exacte', () => {
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        expect(sigDigits(q.rounded)).toBeLessThanOrEqual(sigDigits(q.exact))
      }
    }
  })

  it('la valeur à saisir tient sur quatre chiffres au plus', () => {
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        expect(Math.abs(q.exact)).toBeLessThan(10_000)
        expect(Math.abs(q.exact)).toBeGreaterThan(1e-4)
      }
    }
  })

  it('le raisonnement est décomposé en au moins deux étapes', () => {
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        expect(q.steps.length).toBeGreaterThanOrEqual(2)
        expect(q.steps.length).toBeLessThanOrEqual(4)
        expect(new Set(q.steps.map((st) => st.key)).size).toBe(q.steps.length)
      }
    }
  })

  it('toutes les clés existent en français et en anglais', () => {
    const keys = new Set<string>()
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        keys.add(q.prompt.key)
        for (const st of q.steps) keys.add(st.key)
      }
    }
    for (const lang of LANGS) {
      for (const k of keys) expect(DICT[lang], `${k} manquante en ${lang}`).toHaveProperty(k)
    }
  })

  it('chaque variable du gabarit est fournie, dans les deux langues', () => {
    const seen = (p: Phrase) => {
      for (const lang of LANGS) {
        const tpl = (DICT[lang] as Record<string, string>)[p.key]
        for (const name of placeholders(tpl)) {
          expect(p.vars, `${p.key}/${lang} : {${name}} non fourni`).toHaveProperty(name)
        }
      }
    }
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        seen(q.prompt)
        q.steps.forEach(seen)
      }
    }
  })

  it('ne laisse aucune accolade dans le rendu', () => {
    for (const level of LEVELS) {
      for (const q of sample(i, level)) {
        for (const lang of LANGS) {
          expect(tPhrase(q.prompt, lang)).not.toMatch(/[{}]/)
          for (const st of q.steps) expect(tPhrase(st, lang)).not.toMatch(/[{}]/)
        }
      }
    }
  })

  it('les nombres de l’énoncé se compliquent avec le niveau', () => {
    // Proxy de difficulté : le total de chiffres significatifs manipulés.
    const load = (level: Level) => {
      const qs = sample(i, level)
      const totals = qs.map((q) =>
        Object.values(q.prompt.vars).reduce((a, n) => a + sigDigits(n.v), 0),
      )
      return totals.reduce((a, b) => a + b, 0) / totals.length
    }
    const l = LEVELS.map(load)
    expect(l[4]).toBeGreaterThan(l[0])
    for (let k = 1; k < l.length; k++) expect(l[k]).toBeGreaterThan(l[k - 1] - 0.5)
  })
})

describe('plages par niveau', () => {
  const at = (id: string, level: Level) => {
    const i = TYPES.findIndex((t) => t.id === id)
    return sample(i, level)
  }

  it('les facteurs du produit grandissent', () => {
    const max = (level: Level) =>
      Math.max(...at('magnitudeProduct', level).map((q) => q.prompt.vars.a.v))
    expect(max(1)).toBeLessThanOrEqual(90)
    expect(max(3)).toBeGreaterThan(1000)
    expect(max(5)).toBeGreaterThan(10_000)
  })

  it('le pourcentage d’un nombre porte sur des bases croissantes', () => {
    const max = (level: Level) => Math.max(...at('percentOf', level).map((q) => q.prompt.vars.n.v))
    expect(max(1)).toBeLessThanOrEqual(900)
    expect(max(5)).toBeGreaterThan(100_000)
  })

  it('la moyenne pondérée passe de deux à quatre segments', () => {
    expect(at('weightedMean', 1).every((q) => q.prompt.key.endsWith('2'))).toBe(true)
    expect(at('weightedMean', 5).every((q) => q.prompt.key.endsWith('4'))).toBe(true)
  })

  it('les poids de la moyenne pondérée somment à 100', () => {
    for (const level of LEVELS) {
      for (const q of at('weightedMean', level)) {
        const w = Object.entries(q.prompt.vars)
          .filter(([k]) => /^w\d$/.test(k))
          .reduce((a, [, n]) => a + n.v, 0)
        expect(w).toBeCloseTo(100, 10)
      }
    }
  })

  it('les fractions restent irréductibles et changent de sens', () => {
    const qs = LEVELS.flatMap((l) => at('fractions', l))
    expect(qs.some((q) => q.prompt.key.endsWith('ToPct'))).toBe(true)
    expect(qs.some((q) => q.prompt.key.endsWith('ToFrac'))).toBe(true)
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    for (const q of qs) {
      const vars = Object.assign({}, ...q.steps.map((st) => st.vars))
      const f = vars.f ?? vars.result
      if (f?.num != null && f.den != null) expect(gcd(f.num, f.den)).toBe(1)
    }
  })

  it('le résultat d’exploitation reste positif : le pavé n’a pas de touche moins', () => {
    for (const level of LEVELS) {
      for (const q of at('margin', level)) expect(q.exact).toBeGreaterThan(0)
    }
  })
})

describe('déterminisme', () => {
  it('même graine, mêmes questions', () => {
    for (const t of TYPES) {
      const a = makeRng(99)
      const b = makeRng(99)
      for (const level of LEVELS) {
        expect(t.generate(level, a)).toEqual(t.generate(level, b))
      }
    }
  })
})

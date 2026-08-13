import { fr } from './fr'
import { en } from './en'
import { formatNum } from '@/ui/format'
import type { Key } from './fr'
import type { Lang, Num, Phrase } from '@/core/types'

export type { Key }

export const DICT: Record<Lang, Record<Key, string>> = { fr, en }
export const LANGS: readonly Lang[] = ['fr', 'en']

export type Vars = Record<string, Num | string | number>

/** Interpolation de `{nom}`. Les `Num` passent par le formateur de la langue. */
export function t(key: Key | string, lang: Lang, vars: Vars = {}): string {
  const template = (DICT[lang] as Record<string, string>)[key]
  if (template === undefined) return key
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const v = vars[name]
    if (v === undefined) return whole
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
    return formatNum(v, lang)
  })
}

/** Rend un énoncé ou un chemin de calcul produit par un générateur. */
export function tPhrase(p: Phrase, lang: Lang): string {
  return t(p.key, lang, p.vars)
}

/** Toutes les clés référencées par les générateurs existent-elles dans les deux langues ? */
export function missingKeys(keys: readonly string[]): { fr: string[]; en: string[] } {
  const has = (lang: Lang, k: string) => k in (DICT[lang] as Record<string, string>)
  return {
    fr: keys.filter((k) => !has('fr', k)),
    en: keys.filter((k) => !has('en', k)),
  }
}

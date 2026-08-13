import { DEFAULT_FEEDBACK_MS, DEFAULT_TARGET_MS, initialLevels } from '@/core/session'
import { TYPE_IDS } from '@/core/types'
import type { Attempt, Lang, Level, TypeId, TypeState } from '@/core/types'

export const SCHEMA_VERSION = 1
export const STORAGE_KEY = 'cm:v1'
/** Au-delà, on oublie les plus anciennes tentatives : c'est du localStorage. */
export const MAX_ATTEMPTS = 5000

export type Settings = {
  lang: Lang
  targetMs: number
  /** Durée d'affichage de la correction avant passage. 0 = seulement au tap. */
  feedbackMs: number
  verbalize: boolean
  audio: boolean
  sound: boolean
}

export type SessionRecord = {
  ts: number
  n: number
  medianMs: number | null
  rate: number | null
}

export type State = {
  v: number
  settings: Settings
  levels: Record<TypeId, TypeState>
  attempts: Attempt[]
  /** Jours travaillés, « YYYY-MM-DD ». Alimente la série. */
  days: string[]
  sessions: SessionRecord[]
}

export function defaultSettings(): Settings {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'fr'
  return {
    lang: nav.startsWith('en') ? 'en' : 'fr',
    targetMs: DEFAULT_TARGET_MS,
    feedbackMs: DEFAULT_FEEDBACK_MS,
    verbalize: false,
    audio: false,
    sound: false,
  }
}

export function defaultState(): State {
  return {
    v: SCHEMA_VERSION,
    settings: defaultSettings(),
    levels: initialLevels(),
    attempts: [],
    days: [],
    sessions: [],
  }
}

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)

const clampLevel = (x: unknown): Level => {
  const n = Math.round(Number(x))
  return (Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 1) as Level
}

/**
 * Relit une entrée inconnue — fichier importé, `localStorage` d'une version
 * antérieure — sans jamais lever : ce qui est illisible retombe sur la valeur
 * par défaut, champ par champ.
 */
export function parseState(raw: unknown): State | null {
  if (!isObj(raw)) return null
  const base = defaultState()

  const s = isObj(raw.settings) ? raw.settings : {}
  const settings: Settings = {
    lang: s.lang === 'en' || s.lang === 'fr' ? s.lang : base.settings.lang,
    targetMs:
      typeof s.targetMs === 'number' && s.targetMs >= 5000 && s.targetMs <= 120_000
        ? s.targetMs
        : base.settings.targetMs,
    feedbackMs:
      typeof s.feedbackMs === 'number' && s.feedbackMs >= 0 && s.feedbackMs <= 30_000
        ? s.feedbackMs
        : base.settings.feedbackMs,
    verbalize: s.verbalize === true,
    audio: s.audio === true,
    sound: s.sound === true,
  }

  const levels = initialLevels()
  if (isObj(raw.levels)) {
    for (const id of TYPE_IDS) {
      const l = raw.levels[id]
      if (isObj(l)) {
        levels[id] = {
          level: clampLevel(l.level),
          goodStreak: Math.max(0, Number(l.goodStreak) || 0),
          failStreak: Math.max(0, Number(l.failStreak) || 0),
        }
      }
    }
  }

  const known = new Set<string>(TYPE_IDS)
  const attempts: Attempt[] = Array.isArray(raw.attempts)
    ? raw.attempts
        .filter(
          (a): a is Attempt =>
            isObj(a) &&
            typeof a.ts === 'number' &&
            typeof a.ms === 'number' &&
            typeof a.correct === 'boolean' &&
            typeof a.typeId === 'string' &&
            known.has(a.typeId),
        )
        .map((a) => ({
          ts: a.ts,
          typeId: a.typeId,
          level: clampLevel(a.level),
          ms: Math.max(0, a.ms),
          correct: a.correct,
          given: typeof a.given === 'number' ? a.given : null,
        }))
        .slice(-MAX_ATTEMPTS)
    : []

  const days = Array.isArray(raw.days)
    ? [...new Set(raw.days.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort()
    : []

  const sessions: SessionRecord[] = Array.isArray(raw.sessions)
    ? raw.sessions
        .filter((x): x is SessionRecord => isObj(x) && typeof x.ts === 'number')
        .map((x) => ({
          ts: x.ts,
          n: Number(x.n) || 0,
          medianMs: typeof x.medianMs === 'number' ? x.medianMs : null,
          rate: typeof x.rate === 'number' ? x.rate : null,
        }))
    : []

  return { v: SCHEMA_VERSION, settings, levels, attempts, days, sessions }
}

export function serialize(state: State): string {
  return JSON.stringify(state, null, 2)
}

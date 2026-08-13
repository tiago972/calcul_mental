export type Lang = 'fr' | 'en'

export type Level = 1 | 2 | 3 | 4 | 5
export const LEVELS: readonly Level[] = [1, 2, 3, 4, 5]

export type TypeId =
  | 'magnitudeProduct'
  | 'marketShare'
  | 'percentOf'
  | 'percentChange'
  | 'growthApply'
  | 'cagr'
  | 'margin'
  | 'breakeven'
  | 'perUnit'
  | 'weightedMean'
  | 'fractions'
  | 'marketSizing'

/** Ordre de référence : sert au tirage, aux stats et à l'affichage. */
export const TYPE_IDS: readonly TypeId[] = [
  'magnitudeProduct',
  'marketShare',
  'percentOf',
  'percentChange',
  'growthApply',
  'cagr',
  'margin',
  'breakeven',
  'perUnit',
  'weightedMean',
  'fractions',
  'marketSizing',
]

/** Suffixe d'échelle. `unit` = pas de suffixe. */
export type Scale = 'unit' | 'k' | 'M' | 'Md'

export type NumStyle = 'plain' | 'percent' | 'money' | 'fraction' | 'count'

/**
 * Un nombre prêt à afficher. `v` est la valeur telle qu'elle doit être lue :
 * un chiffre d'affaires de 840 millions d'euros s'écrit { v: 840, style: 'money', scale: 'M' }.
 * Les générateurs pré-divisent, le rendu n'ajoute que le séparateur et le suffixe.
 */
export type Num = {
  v: number
  style?: NumStyle
  scale?: Scale
  /** Décimales imposées à l'affichage. Par défaut : au plus 2, zéros de queue supprimés. */
  d?: number
  /** Renseignés seulement pour style 'fraction' : affichés tels quels (« 3/8 »). */
  num?: number
  den?: number
}

export type Tolerance =
  | { kind: 'rel'; pct: number }
  | { kind: 'abs'; delta: number }
  | { kind: 'exact'; d?: number }

/** Format de la saisie attendue. L'unité est annoncée dans l'énoncé, jamais devinée. */
export type AnswerSpec = {
  style: NumStyle
  scale: Scale
}

export type Phrase = { key: string; vars: Record<string, Num> }

export interface Question {
  typeId: TypeId
  level: Level
  /** Énoncé. */
  prompt: Phrase
  /** Chemin de calcul en une ligne, affiché après réponse. */
  path: Phrase
  /** Valeur exacte, exprimée dans l'unité de `answer`. */
  exact: number
  /** La réponse « attendue » d'un consultant : celle qu'on pose en 20 secondes. */
  rounded: number
  answer: AnswerSpec
  tolerance: Tolerance
  /** Écriture de la réponse attendue quand le nombre seul ne suffit pas (fractions). */
  answerDisplay?: Num
}

export interface Rng {
  next(): number
  int(min: number, max: number): number
  pick<T>(xs: readonly T[]): T
}

export interface ExerciseType {
  id: TypeId
  labelKey: string
  generate(level: Level, rng: Rng): Question
}

export type Verdict = {
  ok: boolean
  /** Écart signé : en % pour une tolérance relative, en points sinon. */
  error: number
  errorUnit: 'pct' | 'pt'
}

/** État adaptatif, mémorisé par type d'exercice. */
export type TypeState = {
  level: Level
  goodStreak: number
  failStreak: number
}

export type Attempt = {
  ts: number
  typeId: TypeId
  level: Level
  ms: number
  correct: boolean
  /** null si la question a été passée (« je ne sais pas »). */
  given: number | null
}

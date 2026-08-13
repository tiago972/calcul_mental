import { magnitudeProduct } from './magnitudeProduct'
import { marketShare } from './marketShare'
import { percentOf } from './percentOf'
import { percentChange } from './percentChange'
import { growthApply } from './growthApply'
import { cagr } from './cagr'
import { margin } from './margin'
import { breakeven } from './breakeven'
import { perUnit } from './perUnit'
import { weightedMean } from './weightedMean'
import { fractions } from './fractions'
import { marketSizing } from './marketSizing'
import { TYPE_IDS } from '../types'
import type { ExerciseType, Level, Question, Rng, TypeId } from '../types'

/**
 * Registre unique. Ajouter un exercice = un fichier exportant un `ExerciseType`,
 * une ligne ici, une ligne dans `TYPE_IDS`, et ses clés dans fr.ts / en.ts.
 */
export const TYPES: readonly ExerciseType[] = [
  magnitudeProduct,
  marketShare,
  percentOf,
  percentChange,
  growthApply,
  cagr,
  margin,
  breakeven,
  perUnit,
  weightedMean,
  fractions,
  marketSizing,
]

const BY_ID = new Map<TypeId, ExerciseType>(TYPES.map((t) => [t.id, t]))

export function getType(id: TypeId): ExerciseType {
  const t = BY_ID.get(id)
  if (!t) throw new Error(`type d'exercice inconnu : ${id}`)
  return t
}

export function generate(id: TypeId, level: Level, rng: Rng): Question {
  return getType(id).generate(level, rng)
}

/** Garde-fou : le registre et la liste d'identifiants ne doivent jamais diverger. */
export function registryIsConsistent(): boolean {
  return (
    TYPES.length === TYPE_IDS.length && TYPE_IDS.every((id) => BY_ID.has(id))
  )
}

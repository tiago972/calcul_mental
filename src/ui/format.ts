import type { Lang, Num, Scale } from '@/core/types'

const LOCALE: Record<Lang, string> = { fr: 'fr-FR', en: 'en-US' }

const SCALE_LABEL: Record<Lang, Record<Scale, string>> = {
  fr: { unit: '', k: 'k', M: 'M', Md: 'Md' },
  en: { unit: '', k: 'k', M: 'M', Md: 'bn' },
}

function digits(n: Num): { maximumFractionDigits: number; minimumFractionDigits: number } {
  if (n.d != null) return { maximumFractionDigits: n.d, minimumFractionDigits: 0 }
  return { maximumFractionDigits: 2, minimumFractionDigits: 0 }
}

/** Le nombre nu, séparateurs de la langue, sans unité ni suffixe. */
export function formatBare(n: Num, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], digits(n)).format(n.v)
}

/** Le nombre tel qu'il se lit dans un énoncé : « 840 M€ », « 18 % », « 3/8 ». */
export function formatNum(n: Num, lang: Lang): string {
  if (n.style === 'fraction' && n.num != null && n.den != null) return `${n.num}/${n.den}`

  const body = formatBare(n, lang)
  const s = SCALE_LABEL[lang][n.scale ?? 'unit']

  switch (n.style) {
    case 'percent':
      // Espace insécable étroite avant le signe en français, collé en anglais.
      return lang === 'fr' ? `${body} %` : `${body}%`
    case 'money':
      return lang === 'fr' ? `${body} ${s}€` : `€${body}${s}`
    default:
      // « 70 M » en français, « 70M » en anglais : chacun sa typographie.
      if (!s) return body
      return lang === 'fr' ? `${body} ${s}` : `${body}${s}`
  }
}

/** Clé i18n de l'unité de réponse annoncée sous l'énoncé. */
export function answerHintKey(style: Num['style'], scale: Scale): string {
  if (style === 'percent') return 'answer.hint.percent'
  if (style === 'fraction') return 'answer.hint.fraction'
  return `answer.hint.${style === 'money' ? 'money' : style === 'count' ? 'count' : 'plain'}.${scale}`
}

/** Rend la réponse de l'utilisateur dans le format attendu, pour le retour. */
export function formatAnswer(
  v: number,
  spec: { style: Num['style']; scale: Scale },
  lang: Lang,
  d?: number,
): string {
  if (spec.style === 'fraction') return new Intl.NumberFormat(LOCALE[lang], {
    maximumFractionDigits: 3,
  }).format(v)
  return formatNum({ v, style: spec.style, scale: spec.scale, d }, lang)
}

/** mm:ss pour les chronos de bloc, « 12,4 s » pour les temps de réponse. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatSeconds(ms: number, lang: Lang): string {
  const v = new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 1 }).format(ms / 1000)
  return `${v} s`
}

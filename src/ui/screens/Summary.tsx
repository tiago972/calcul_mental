import { useMemo } from 'react'
import { advise, outcome } from '@/core/session'
import { byType, weakest } from '@/core/stats'
import { t } from '@/i18n'
import { useApp } from '@/store/useApp'
import { formatSeconds } from '../format'
import type { Attempt } from '@/core/types'

export function Summary({ attempts, onHome }: { attempts: Attempt[]; onHome: () => void }) {
  const { state } = useApp()
  const lang = state.settings.lang
  const targetMs = state.settings.targetMs

  const { o, weak, advice } = useMemo(() => {
    const now = Date.now()
    const rows = byType(attempts, state.levels, now)
    const w = weakest(rows, 2, 2)
    return {
      o: outcome(attempts, targetMs),
      weak: w,
      advice: advise(attempts, targetMs, w[0]?.typeId),
    }
  }, [attempts, state.levels, targetMs])

  const rate = o.rate === null ? '—' : `${Math.round(o.rate * 100)} %`

  return (
    <div className="mx-auto flex screen max-w-md flex-col px-5 safe-t safe-b">
      <header className="pt-8 text-sm text-muted">{t('summary.title', lang)}</header>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-muted">{t('summary.median', lang)}</div>
          <div className="text-4xl font-light tabular-nums text-ink">
            {o.medianMs === null ? '—' : formatSeconds(o.medianMs, lang)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted">{t('summary.rate', lang)}</div>
          <div className="text-4xl font-light tabular-nums text-ink">{rate}</div>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted">{t('summary.count', lang, { n: o.n })}</p>

      {weak.length > 0 && (
        <section className="mt-10">
          <div className="text-xs uppercase tracking-wide text-muted">
            {t('summary.weakest', lang)}
          </div>
          <ul className="mt-2 space-y-1">
            {weak.map((r) => (
              <li key={r.typeId} className="flex justify-between text-sm">
                <span>{t(`type.${r.typeId}`, lang)}</span>
                <span className="tabular-nums text-muted">
                  {r.rate === null ? '—' : `${Math.round(r.rate * 100)} %`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 rounded-xl bg-accent-soft p-4">
        <div className="text-xs uppercase tracking-wide text-accent">
          {t('summary.advice', lang)}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink">
          {t(advice.key, lang, advice.typeId ? { type: t(`type.${advice.typeId}`, lang) } : {})}
        </p>
      </section>

      <div className="mt-auto pb-6 pt-10">
        <button className="btn" onClick={onHome}>
          {t('summary.home', lang)}
        </button>
      </div>
    </div>
  )
}

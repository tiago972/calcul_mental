import { useMemo, useRef, useState } from 'react'
import { byType, dayKey, streak } from '@/core/stats'
import { t } from '@/i18n'
import { parseState, serialize } from '@/store/schema'
import { useApp } from '@/store/useApp'
import { Sparkline } from '../components/Sparkline'
import { formatSeconds } from '../format'

export function Stats({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const fileRef = useRef<HTMLInputElement>(null)
  const [note, setNote] = useState<string | null>(null)

  const rows = useMemo(() => byType(state.attempts, state.levels, Date.now()), [state])
  const n = streak(state.days, dayKey(Date.now()))
  const curve = state.sessions
    .map((s) => s.medianMs)
    .filter((x): x is number => x !== null)

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([serialize(state)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `calcul-mental-${dayKey(Date.now())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File) => {
    try {
      const parsed = parseState(JSON.parse(await file.text()))
      if (!parsed) throw new Error('format')
      dispatch({ type: 'replace', state: parsed })
      setNote(t('stats.importOk', lang))
    } catch {
      setNote(t('stats.importFail', lang))
    }
  }

  return (
    <div className="mx-auto screen max-w-md px-5 pb-10 safe-t safe-b">
      <header className="flex items-center justify-between pt-6">
        <h1 className="text-sm text-muted">{t('stats.title', lang)}</h1>
        <button className="text-sm text-accent" onClick={onBack}>
          {t('settings.back', lang)}
        </button>
      </header>

      <div className="mt-8 flex items-baseline gap-3">
        <span className="text-6xl font-light tabular-nums text-accent">{n}</span>
        <span className="text-sm text-muted">
          {t('stats.streak', lang)} · {t(n === 1 ? 'stats.days.one' : 'stats.days.many', lang)}
        </span>
      </div>

      {state.attempts.length === 0 ? (
        <p className="mt-10 text-sm text-muted">{t('stats.none', lang)}</p>
      ) : (
        <>
          {curve.length > 1 && (
            <section className="mt-10">
              <div className="text-xs uppercase tracking-wide text-muted">
                {t('stats.medianCurve', lang)}
              </div>
              <div className="mt-2">
                <Sparkline values={curve} label={t('stats.medianCurve', lang)} />
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="text-xs uppercase tracking-wide text-muted">
              {t('stats.byType', lang)}
            </div>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="font-normal">{t('stats.type', lang)}</th>
                  <th className="w-14 text-right font-normal">{t('stats.rate', lang)}</th>
                  <th className="w-16 text-right font-normal">{t('stats.median', lang)}</th>
                  <th className="w-8 text-right font-normal">{t('stats.level', lang)}</th>
                  <th className="w-10 text-right font-normal">{t('stats.trend', lang)}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {rows.map((r) => (
                  <tr key={r.typeId} className="border-t border-hair">
                    <td className="py-2 pr-2 font-sans">{t(`type.${r.typeId}`, lang)}</td>
                    <td className="text-right text-muted">
                      {r.rate === null ? '—' : `${Math.round(r.rate * 100)}%`}
                    </td>
                    <td className="text-right text-muted">
                      {r.medianMs === null ? '—' : formatSeconds(r.medianMs, lang)}
                    </td>
                    <td className="text-right text-muted">{r.level}</td>
                    <td
                      className={`text-right ${
                        r.trendMs === null ? 'text-muted' : r.trendMs < 0 ? 'text-accent' : 'text-ink'
                      }`}
                    >
                      {r.trendMs === null ? '—' : `${r.trendMs < 0 ? '−' : '+'}${Math.abs(Math.round(r.trendMs / 1000))}s`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      <section className="mt-12 space-y-3">
        <button className="btn-ghost" onClick={exportJson}>
          {t('stats.export', lang)}
        </button>
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
          {t('stats.import', lang)}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importJson(f)
            e.target.value = ''
          }}
        />
        <button
          className="w-full py-3 text-center text-sm text-muted"
          onClick={() => {
            if (confirm(t('stats.resetConfirm', lang))) dispatch({ type: 'reset' })
          }}
        >
          {t('stats.reset', lang)}
        </button>
        {note && <p className="text-center text-xs text-muted">{note}</p>}
      </section>
    </div>
  )
}

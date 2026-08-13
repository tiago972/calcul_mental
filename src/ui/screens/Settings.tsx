import { useEffect, useState } from 'react'
import { clearClips, listClips } from '@/audio/recorder'
import { FEEDBACK_CHOICES } from '@/core/session'
import { t } from '@/i18n'
import { useApp } from '@/store/useApp'
import type { Clip } from '@/audio/recorder'
import type { Lang } from '@/core/types'

const TARGETS = [15_000, 20_000, 30_000, 45_000]

function Row({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hair py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{label}</span>
        {children}
      </div>
      {help && <p className="mt-1 pr-16 text-xs leading-relaxed text-muted">{help}</p>}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    /* Le bouton fait 44 pt, la pastille n'en dessine que 28 : la zone tactile
       est réelle plutôt qu'étendue par un pseudo-élément, que l'empilement des
       rangées suivantes recouvrait par en dessous. La marge négative rend au
       voisinage la hauteur que le bouton prend en trop. */
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="tap -my-2 shrink-0"
    >
      <span
        className={`flex h-7 w-12 items-center rounded-full border transition-colors ${
          on ? 'border-accent bg-accent' : 'border-hair bg-white'
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            on ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}

export function Settings({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useApp()
  const s = state.settings
  const lang = s.lang
  const [clips, setClips] = useState<Clip[]>([])

  useEffect(() => {
    if (s.audio) listClips().then(setClips)
  }, [s.audio])

  return (
    <div className="mx-auto screen max-w-md px-5 pb-10 safe-t safe-b">
      <header className="flex items-center justify-between pt-6">
        <h1 className="text-sm text-muted">{t('settings.title', lang)}</h1>
        <button className="tap -mx-2 px-2 text-sm text-accent" onClick={onBack}>
          {t('settings.back', lang)}
        </button>
      </header>

      <div className="mt-6">
        <Row label={t('settings.lang', lang)}>
          <div className="flex gap-2">
            {(['fr', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => dispatch({ type: 'settings', patch: { lang: l } })}
                className={`tap rounded-lg px-3.5 text-sm ${
                  l === lang ? 'bg-accent text-white' : 'border border-hair text-muted'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </Row>

        <Row label={t('settings.target', lang)}>
          <div className="flex gap-2">
            {TARGETS.map((ms) => (
              <button
                key={ms}
                onClick={() => dispatch({ type: 'settings', patch: { targetMs: ms } })}
                className={`tap whitespace-nowrap rounded-lg px-3 text-sm ${
                  ms === s.targetMs ? 'bg-accent text-white' : 'border border-hair text-muted'
                }`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>
        </Row>

        <Row label={t('settings.feedback', lang)}>
          <div className="flex gap-2">
            {FEEDBACK_CHOICES.map((ms) => (
              <button
                key={ms}
                onClick={() => dispatch({ type: 'settings', patch: { feedbackMs: ms } })}
                className={`tap whitespace-nowrap rounded-lg px-3 text-sm ${
                  ms === s.feedbackMs ? 'bg-accent text-white' : 'border border-hair text-muted'
                }`}
              >
                {ms === 0 ? t('settings.feedback.manual', lang) : `${ms / 1000}s`}
              </button>
            ))}
          </div>
        </Row>

        <Row label={t('settings.verbalize', lang)} help={t('settings.verbalize.help', lang)}>
          <Toggle
            on={s.verbalize}
            onChange={(v) =>
              dispatch({ type: 'settings', patch: { verbalize: v, audio: v ? s.audio : false } })
            }
          />
        </Row>

        {s.verbalize && (
          <Row label={t('settings.audio', lang)} help={t('settings.audio.help', lang)}>
            <Toggle on={s.audio} onChange={(v) => dispatch({ type: 'settings', patch: { audio: v } })} />
          </Row>
        )}

        <Row label={t('settings.sound', lang)}>
          <Toggle on={s.sound} onChange={(v) => dispatch({ type: 'settings', patch: { sound: v } })} />
        </Row>
      </div>

      {s.audio && (
        <section className="mt-10">
          <div className="text-xs uppercase tracking-wide text-muted">
            {t('settings.recordings', lang)}
          </div>
          {clips.length === 0 ? (
            <p className="mt-2 text-xs text-muted">{t('settings.recordings.none', lang)}</p>
          ) : (
            <>
              <ul className="mt-3 space-y-3">
                {clips.slice().reverse().map((c) => (
                  <li key={c.id}>
                    <div className="text-xs text-muted">{t(`type.${c.typeId}`, lang)}</div>
                    <audio className="mt-1 w-full" controls src={URL.createObjectURL(c.blob)} />
                  </li>
                ))}
              </ul>
              <button
                className="mt-4 w-full py-3 text-sm text-muted"
                onClick={() => clearClips().then(() => setClips([]))}
              >
                {t('settings.recordings.clear', lang)}
              </button>
            </>
          )}
        </section>
      )}
    </div>
  )
}

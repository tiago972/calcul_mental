import { dayKey, streak } from '@/core/stats'
import { t } from '@/i18n'
import { useApp } from '@/store/useApp'
import { PressButton } from '../components/PressButton'

export function Home({ onStart, onStats, onSettings }: {
  onStart: () => void
  onStats: () => void
  onSettings: () => void
}) {
  const { state } = useApp()
  const lang = state.settings.lang
  const n = streak(state.days, dayKey(Date.now()))

  return (
    <div className="mx-auto flex screen max-w-md flex-col px-5 safe-t safe-b">
      <header className="pt-6 text-sm text-muted">{t('app.title', lang)}</header>

      {/* La série est le seul chiffre en grand : la régularité est l'objectif. */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {n > 0 ? (
          <>
            <div className="text-8xl font-light tabular-nums text-accent">{n}</div>
            <div className="mt-2 text-base text-muted">
              {t(n === 1 ? 'home.streak.one' : 'home.streak.many', lang)}
            </div>
          </>
        ) : (
          <div className="text-base text-muted">{t('home.streak.none', lang)}</div>
        )}
      </div>

      <div className="pb-6">
        <PressButton className="btn" onActivate={onStart}>
          {t('home.start', lang)}
        </PressButton>
        <p className="mt-3 text-center text-xs text-muted">{t('home.duration', lang)}</p>
        <div className="mt-6 flex gap-3">
          <PressButton className="btn-ghost" onActivate={onStats}>
            {t('home.stats', lang)}
          </PressButton>
          <PressButton className="btn-ghost" onActivate={onSettings}>
            {t('home.settings', lang)}
          </PressButton>
        </div>
      </div>
    </div>
  )
}

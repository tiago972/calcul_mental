/** Courbe minimale, sans axes ni graduations : seule la tendance compte. */
export function Sparkline({
  values,
  height = 48,
  label,
}: {
  values: number[]
  height?: number
  label?: string
}) {
  if (values.length < 2) return null
  const w = 300
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = height - ((v - min) / span) * (height - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="text-accent"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

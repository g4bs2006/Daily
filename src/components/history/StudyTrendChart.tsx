import { useState } from 'react'
import { formatDateShort } from '../../lib/date'

type Point = { date: string; minutos: number | null; registrado: boolean }

type Props = {
  points: Point[]
}

const WIDTH = 600
const HEIGHT = 160
const PAD_LEFT = 8
const PAD_RIGHT = 8
const PAD_TOP = 20
const PAD_BOTTOM = 8
const BAR_GAP = 2

export function StudyTrendChart({ points }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const max = Math.max(1, ...points.map((p) => p.minutos ?? 0))
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
  const barSlot = plotWidth / points.length
  const barWidth = Math.min(24, barSlot - BAR_GAP)

  const latestIndex = points.length - 1
  const hovered = hoverIndex ?? latestIndex
  const hoveredPoint = points[hovered]

  return (
    <div className="viz-root">
      <style>{`
        .viz-root {
          color-scheme: light;
          --surface-1: #fcfcfb;
          --text-primary: #0b0b0b;
          --text-secondary: #52514e;
          --text-muted: #898781;
          --gridline: #e1e0d9;
          --baseline: #c3c2b7;
          --series-1: #2a78d6;
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .viz-root {
            color-scheme: dark;
            --surface-1: #1a1a19;
            --text-primary: #ffffff;
            --text-secondary: #c3c2b7;
            --text-muted: #898781;
            --gridline: #2c2c2a;
            --baseline: #383835;
            --series-1: #3987e5;
          }
        }
        :root[data-theme="dark"] .viz-root {
          color-scheme: dark;
          --surface-1: #1a1a19;
          --text-primary: #ffffff;
          --text-secondary: #c3c2b7;
          --text-muted: #898781;
          --gridline: #2c2c2a;
          --baseline: #383835;
          --series-1: #3987e5;
        }
      `}</style>

      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Minutos de estudo — últimos 30 dias
        </p>
        {hoveredPoint && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="capitalize">{formatDateShort(hoveredPoint.date)}</span>
            {' · '}
            {hoveredPoint.registrado ? `${hoveredPoint.minutos ?? 0} min` : 'não registrado'}
          </p>
        )}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        role="img"
        aria-label="Gráfico de barras dos minutos de estudo nos últimos 30 dias"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line
          x1={PAD_LEFT}
          x2={WIDTH - PAD_RIGHT}
          y1={HEIGHT - PAD_BOTTOM}
          y2={HEIGHT - PAD_BOTTOM}
          stroke="var(--baseline)"
          strokeWidth={1}
        />
        {points.map((p, i) => {
          const value = p.minutos ?? 0
          const barHeight = value === 0 ? 0 : Math.max(2, (value / max) * plotHeight)
          const x = PAD_LEFT + i * barSlot + (barSlot - barWidth) / 2
          const y = HEIGHT - PAD_BOTTOM - barHeight
          const isHovered = hovered === i
          return (
            <g key={p.date}>
              {p.registrado ? (
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill="var(--series-1)"
                  opacity={isHovered ? 1 : 0.85}
                  onMouseEnter={() => setHoverIndex(i)}
                />
              ) : (
                <rect
                  x={x}
                  y={HEIGHT - PAD_BOTTOM - 2}
                  width={barWidth}
                  height={2}
                  fill="var(--text-muted)"
                  opacity={isHovered ? 0.9 : 0.5}
                  onMouseEnter={() => setHoverIndex(i)}
                />
              )}
              <rect
                x={x - BAR_GAP / 2}
                y={PAD_TOP}
                width={barWidth + BAR_GAP}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
              />
            </g>
          )
        })}
        {hoveredPoint?.registrado && (
          <text
            x={PAD_LEFT + hovered * barSlot + barSlot / 2}
            y={PAD_TOP - 6}
            textAnchor="middle"
            fontSize={11}
            fill="var(--text-secondary)"
          >
            {hoveredPoint.minutos ?? 0}
          </text>
        )}
      </svg>
    </div>
  )
}

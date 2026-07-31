import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
}

export function IconAnchor(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v13" />
      <path d="M7 12H3a9 9 0 0 0 9 9 9 9 0 0 0 9-9h-4" />
      <path d="M8 9l4-2 4 2" />
    </svg>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20l1-4.5L15.5 5 19 8.5 8.5 19 4 20Z" />
      <path d="M13 7l3.5 3.5" />
    </svg>
  )
}

export function IconGauge(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15l4-5" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12l5 5L19 7" />
    </svg>
  )
}

export function IconGear(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3M3 12h2.5M18.5 12H21" />
    </svg>
  )
}

export function IconBriefcase(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="8" width="18" height="11" rx="1.5" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  )
}

export function IconCoin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M9.5 10a2.2 2.2 0 0 1 2.5-1.6c1.4.2 2.5 1 2.5 2.1 0 2.2-5 1.4-5 3.6 0 1.1 1.1 1.9 2.5 2.1a2.2 2.2 0 0 0 2.5-1.6" />
    </svg>
  )
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function IconPower(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v8" />
      <path d="M6.5 6.5a8 8 0 1 0 11 0" />
    </svg>
  )
}

export function IconScale(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="14" width="16" height="7" rx="1.5" />
      <circle cx="12" cy="8" r="4" />
      <path d="M12 12v2" />
    </svg>
  )
}

export function IconChevron(props: IconProps & { direction?: 'left' | 'right' }) {
  const { direction = 'left', ...rest } = props
  return (
    <svg {...base(rest)}>
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  )
}

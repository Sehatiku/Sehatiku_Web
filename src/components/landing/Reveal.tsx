import type { ReactNode, CSSProperties } from 'react'
import { useReveal } from '../../lib/useReveal'

/**
 * Wraps children with an elegant staggered scroll-reveal entrance.
 * `delay` (ms) lets callers cascade siblings.
 */
export default function Reveal({
  children,
  delay = 0,
  style,
  className = '',
}: {
  children: ReactNode
  delay?: number
  style?: CSSProperties
  className?: string
}) {
  const { ref, shown } = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  )
}

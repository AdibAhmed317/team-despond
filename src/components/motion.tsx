import { createElement, Fragment } from 'react'
import { motion, MotionConfig } from 'motion/react'

// Motion vocabulary for the site, kept small on purpose:
//   one spring for arrivals, one rise for headlines, nothing that loops.
// MotionConfig reducedMotion="user" turns every transform off for people who
// ask their OS for less motion; opacity fades remain.

export const spring = { type: 'spring', stiffness: 110, damping: 20, mass: 0.9 } as const
const ease = [0.16, 1, 0.3, 1] as const

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/** Settles into place once, when it scrolls into view. `data-m` lets the noscript rule show it without JS. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
  style,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
  style?: React.CSSProperties
}) {
  const M = motion[as]
  return (
    <M
      data-m=""
      className={className}
      style={style}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ ...spring, delay, opacity: { duration: 0.6, ease, delay } }}
    >
      {children}
    </M>
  )
}

/**
 * A headline whose words rise from behind a mask, staggered.
 * `onLoad` uses a CSS animation so it plays on first paint, before React hydrates
 * (the hero head must never wait for JavaScript). `inView` uses Motion.
 */
export function RiseWords({
  text,
  as = 'h2',
  className,
  id,
  trigger = 'inView',
}: {
  text: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  id?: string
  trigger?: 'onLoad' | 'inView'
}) {
  const words = text.split(' ')
  if (trigger === 'onLoad') {
    return createElement(
      as,
      { className: `${className ?? ''} rise`, id, 'aria-label': text },
      words.map((w, i) => (
        <Fragment key={i}>
          <span className="rise__mask" aria-hidden="true">
            <span className="rise__word" style={{ '--i': i } as React.CSSProperties}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      )),
    )
  }
  return createElement(
    motion[as],
    {
      className,
      id,
      'aria-label': text,
      initial: 'hidden',
      whileInView: 'shown',
      viewport: { once: true, margin: '0px 0px -10% 0px' },
      transition: { staggerChildren: 0.045 },
    },
    words.map((w, i) => (
      <Fragment key={i}>
        <span className="rise__mask" aria-hidden="true">
          <motion.span
            data-m=""
            className="rise__word"
            variants={{ hidden: { y: '105%' }, shown: { y: '0%' } }}
            transition={{ duration: 0.8, ease }}
          >
            {w}
          </motion.span>
        </span>
        {i < words.length - 1 ? ' ' : ''}
      </Fragment>
    )),
  )
}

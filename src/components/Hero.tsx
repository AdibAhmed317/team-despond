import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Service } from '#/content/site'
import { Photo } from '#/components/Photo'
import { createRackFocus } from '#/components/rack-focus'
import { RiseWords } from '#/components/motion'
import type { RackFocus } from '#/components/rack-focus'

const PULL_MS = 750

export function Hero({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0)
  const [pulling, setPulling] = useState(false)
  const [pressed, setPressed] = useState(0)
  const reel = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const focus = useRef<RackFocus | null>(null)
  const shown = useRef(0)
  const queued = useRef<number | null>(null)
  const busy = useRef(false)
  const hoverTimer = useRef<number>(0)

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (still || saveData || !reel.current || !canvas.current) return
    const imgs = Array.from(reel.current.querySelectorAll<HTMLImageElement>('[data-slot] > img'))
    focus.current = createRackFocus(canvas.current, imgs)
    if (focus.current) reel.current.dataset.gl = ''
    const el = reel.current
    return () => {
      delete el.dataset.gl
      focus.current?.dispose()
      focus.current = null
    }
  }, [])

  const go = async (to: number) => {
    if (to === shown.current && !busy.current) return
    if (busy.current) {
      setPressed(to)
      queued.current = to
      return
    }
    busy.current = true
    setPressed(to)
    const from = shown.current
    if (focus.current) {
      try {
        // Swap the frame underneath only once the canvas covers it.
        await focus.current.pull(from, to, PULL_MS, () => {
          setPulling(true)
          setActive(to)
        })
      } catch (err) {
        if (import.meta.env.DEV) console.warn('rack focus fell back to the crossfade:', err)
        setActive(to)
        focus.current.dispose()
        focus.current = null // tainted or failed frame: fall back to the crossfade
      }
    } else setActive(to)
    shown.current = to
    setPulling(false)
    busy.current = false
    const next = queued.current
    queued.current = null
    if (next !== null && next !== to) void go(next)
  }

  const current = services[pressed]

  return (
    <section className="hero" aria-labelledby="hero-head">
      <div ref={reel} className="hero__reel" data-pulling={pulling || undefined}>
        {services.map((s, i) => (
          <Photo
            key={s.slug}
            photo={s.photo}
            slot={`hero-${s.slug}`}
            want={`A frame from Team Despond's own ${s.name.toLowerCase()} work, landscape, dark third at the bottom`}
            className={i === active ? 'hero__frame is-on' : 'hero__frame'}
            priority={i === 0}
            cors
          />
        ))}
        <canvas ref={canvas} className="hero__gl" aria-hidden="true" />
      </div>

      <div className="hero__body container">
        <p className="hero__caption" aria-live="polite">
          {current.summary}
        </p>
        <RiseWords as="h1" id="hero-head" className="hero__head" trigger="onLoad" text="We create visual stories that make brands stand out." />
        <div className="hero__foot">
          <p className="lead">
            From cinematic filmmaking to commercial photography and videography, we bring ideas to life through
            creative storytelling.
          </p>
          <div className="actions">
            <Link to="/work" className="btn">
              Explore our work
            </Link>
            <Link to="/contact" className="btn btn--primary">
              Get in touch
            </Link>
          </div>
        </div>

        <div className="focus-switch" role="group" aria-label="Pull focus to a discipline">
          {services.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              className="focus-switch__item"
              aria-pressed={i === pressed}
              onClick={() => void go(i)}
              onFocus={() => void go(i)}
              onPointerEnter={(e) => {
                if (e.pointerType !== 'mouse') return
                window.clearTimeout(hoverTimer.current)
                hoverTimer.current = window.setTimeout(() => void go(i), 140)
              }}
              onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
            >
              <span className="focus-switch__n num" aria-hidden="true">
                {i + 1}
              </span>
              {s.short}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

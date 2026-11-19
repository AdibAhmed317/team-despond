import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Project, Service } from '#/content/site'
import { Photo } from '#/components/Photo'

// The v2 hero: an edit suite. A monitor shows the selected project; the
// timeline below holds one clip per featured project. Hover, click or the
// arrow keys move the playhead; nothing advances on its own.

export function Suite({ projects, services }: { projects: Project[]; services: Service[] }) {
  const [at, setAt] = useState(0)
  const clips = useRef<(HTMLButtonElement | null)[]>([])
  const nameOf = (slug: string) => services.find((s) => s.slug === slug)?.name ?? slug
  if (!projects.length) return null
  const p = projects[at]

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? projects.length - 1 : at + step
    if (to === at || to < 0 || to >= projects.length) return
    e.preventDefault()
    setAt(to)
    clips.current[to]?.focus()
  }

  return (
    <div className="m-suite">
      <Link to="/v2/work/$slug" params={{ slug: p.slug }} className="m-monitor" aria-label={`Open ${p.title}`}>
        {projects.map((x, i) => (
          <Photo
            key={x.slug}
            photo={x.cover}
            slot={`v2-monitor-${i + 1}`}
            sizes="(min-width: 75rem) 1240px, 100vw"
            priority={i === 0}
            className={i === at ? 'm-monitor__frame is-on' : 'm-monitor__frame'}
          />
        ))}
        <span className="m-monitor__bar" aria-hidden="true">
          <span>{nameOf(p.category)}</span>
          <span className="num">
            {String(at + 1).padStart(2, '0')} of {String(projects.length).padStart(2, '0')}
          </span>
        </span>
        <span className="m-monitor__title">
          <span className="m-monitor__name">{p.title}</span>
          <span className="m-monitor__line">{p.summary}</span>
        </span>
      </Link>

      <div className="m-timeline" role="tablist" aria-label="Featured projects" onKeyDown={onKey}>
        <span className="m-timeline__head" style={{ '--at': at, '--n': projects.length } as React.CSSProperties} aria-hidden="true" />
        {projects.map((x, i) => (
          <button
            key={x.slug}
            ref={(el) => {
              clips.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={i === at}
            tabIndex={i === at ? 0 : -1}
            className="m-clip"
            onClick={() => setAt(i)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setAt(i)}
          >
            <span className="m-clip__thumb">
              <img src={x.cover.src.replace('/1280px-', '/330px-')} alt="" decoding="async" />
            </span>
            <span className="m-clip__label">
              <span className="num">{String(i + 1).padStart(2, '0')}</span> {x.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

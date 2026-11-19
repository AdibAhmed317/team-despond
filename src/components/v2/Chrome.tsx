import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'
import { contact, projects, services } from '#/content/site'

const links = [
  { to: '/v2/work', label: 'Work' },
  { to: '/v2/services', label: 'Services' },
  { to: '/v2/about', label: 'About' },
] as const

// ---------- quick jump (⌘K / Ctrl+K) ----------

type Hit = { kind: 'Page' | 'Service' | 'Project'; label: string; hint: string; go: () => void }

function useHits(query: string, close: () => void): Hit[] {
  const navigate = useNavigate()
  return useMemo(() => {
    const all: Hit[] = [
      ...[
        ['Home', '/v2'],
        ['Work', '/v2/work'],
        ['Services', '/v2/services'],
        ['About', '/v2/about'],
        ['Contact', '/v2/contact'],
      ].map(([label, to]) => ({ kind: 'Page' as const, label, hint: to, go: () => navigate({ to }) })),
      ...services.map((s) => ({ kind: 'Service' as const, label: s.name, hint: s.summary, go: () => navigate({ to: '/v2/work', search: { category: s.slug } }) })),
      ...projects.map((p) => ({
        kind: 'Project' as const,
        label: p.title,
        hint: services.find((s) => s.slug === p.category)?.name ?? '',
        go: () => navigate({ to: '/v2/work/$slug', params: { slug: p.slug } }),
      })),
    ]
    const q = query.trim().toLowerCase()
    const hits = q ? all.filter((h) => `${h.label} ${h.hint}`.toLowerCase().includes(q)) : all
    return hits.slice(0, 9).map((h) => ({ ...h, go: () => (close(), h.go()) }))
  }, [query, navigate, close])
}

export function QuickJump({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const hits = useHits(q, onClose)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      setQ('')
      setI(0)
      d.showModal()
    }
    if (!open && d.open) d.close()
  }, [open])
  useEffect(() => setI(0), [q])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setI((x) => Math.min(hits.length - 1, x + 1)))
    if (e.key === 'ArrowUp') (e.preventDefault(), setI((x) => Math.max(0, x - 1)))
    if (e.key === 'Enter' && hits[i]) (e.preventDefault(), hits[i].go())
  }

  return (
    <dialog ref={ref} className="m-jump" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-label="Jump to a page or project">
      <div className="m-jump__field">
        <Search size={18} aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Jump to a project, service or page"
          aria-controls="m-jump-list"
          aria-activedescendant={hits[i] ? `m-hit-${i}` : undefined}
          autoFocus
        />
        <kbd>Esc</kbd>
      </div>
      {hits.length ? (
        <ul id="m-jump-list" role="listbox" className="m-jump__list">
          {hits.map((h, n) => (
            <li key={`${h.kind}-${h.label}`} id={`m-hit-${n}`} role="option" aria-selected={n === i} onPointerMove={() => setI(n)} onClick={h.go}>
              <span className="m-jump__kind">{h.kind}</span>
              <span className="m-jump__label">{h.label}</span>
              <span className="m-jump__hint">{h.hint}</span>
              {n === i ? <ArrowRight size={16} aria-hidden /> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-jump__empty">Nothing matches “{q}”. Try a place, a service or a project name.</p>
      )}
    </dialog>
  )
}

// ---------- nav: a slab ----------

export function V2Nav() {
  const [menu, setMenu] = useState(false)
  const [jump, setJump] = useState(false)
  const path = useRouterState({ select: (s) => s.location.pathname })
  const [mac, setMac] = useState(false)

  useEffect(() => setMenu(false), [path])
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform))
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setJump((j) => !j)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <a className="m-skip" href="#m-main">
        Skip to content
      </a>
      <header className="m-nav">
        <div className="m-wrap m-nav__bar">
          <Link to="/v2" className="m-mark" aria-label="Team Despond, home">
            Team Despond
          </Link>
          <nav id="m-links" className="m-nav__links" data-open={menu || undefined} aria-label="Main">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="m-nav__link" activeProps={{ 'aria-current': 'page' }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="m-nav__end">
            <button type="button" className="m-jumpbtn" onClick={() => setJump(true)} aria-keyshortcuts="Control+K Meta+K">
              <Search size={16} aria-hidden />
              <span className="m-jumpbtn__text">Search</span>
              <kbd>{mac ? '⌘' : 'Ctrl'} K</kbd>
            </button>
            <Link to="/v2/contact" className="m-btn m-btn--primary m-nav__cta">
              Start a project
            </Link>
            <button type="button" className="m-btn m-nav__toggle" aria-expanded={menu} aria-controls="m-links" onClick={() => setMenu((m) => !m)}>
              {menu ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>
      <QuickJump open={jump} onClose={() => setJump(false)} />
    </>
  )
}

// ---------- footer: a statement ----------

export function V2Footer() {
  const credits = useMemo(() => {
    const seen = new Set<string>()
    return projects
      .flatMap((p) => [p.cover, ...p.gallery])
      .concat(services.map((s) => s.photo))
      .map((p) => p.credit)
      .filter((c): c is NonNullable<typeof c> => !!c && !seen.has(c.href) && !!seen.add(c.href))
  }, [])

  return (
    <footer className="m-footer">
      <div className="m-wrap">
        <p className="m-footer__statement">
          Film, photography and video from Sydney. <Link to="/v2/contact">Start a project.</Link>
        </p>
        <div className="m-footer__grid">
          <ul role="list">
            {[['Home', '/v2'], ['Work', '/v2/work'], ['Services', '/v2/services'], ['About', '/v2/about'], ['Contact', '/v2/contact']].map(([l, to]) => (
              <li key={to}>
                <Link to={to}>{l}</Link>
              </li>
            ))}
          </ul>
          <ul role="list">
            <li>{contact.city}</li>
            <li>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <span className="m-gap">studio email</span>}</li>
            <li>{contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : <span className="m-gap">studio phone</span>}</li>
          </ul>
          <ul role="list">
            <li>{contact.instagram ? <a href={contact.instagram}>Instagram</a> : <span className="m-gap">Instagram link</span>}</li>
            <li>{contact.facebook ? <a href={contact.facebook}>Facebook</a> : <span className="m-gap">Facebook link</span>}</li>
            <li>
              <Link to="/">See the first design</Link>
            </li>
          </ul>
        </div>
        <p className="m-footer__legal">© {new Date().getFullYear()} Team Despond</p>
        <p className="m-footer__credits" data-credits>
          Photographs:{' '}
          {credits.map((c, i) => (
            <span key={c.href}>
              <a href={c.href}>{c.name}</a> ({c.license}){i < credits.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
      </div>
    </footer>
  )
}

import { useEffect, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { contact, credits } from '#/content/site'

const links = [
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const

/** A fact the brief did not give: shown as a marked gap, never invented. */
export function Fill({ children }: { children: React.ReactNode }) {
  return <span className="fill">{children}</span>
}

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const path = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => setOpen(false), [path])
  useEffect(() => {
    const sentinel = document.getElementById('nav-sentinel')
    if (!sentinel) return
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting))
    io.observe(sentinel)
    return () => io.disconnect()
  }, [path])

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <span id="nav-sentinel" aria-hidden="true" />
      <header className="nav" data-solid={solid || open || undefined}>
        <div className="container nav__bar">
          <Link to="/" className="wordmark" aria-label="Team Despond, home">
            Team Despond
          </Link>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-links"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="nav-links" className="nav__links" data-open={open || undefined} aria-label="Main">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="nav__link" activeProps={{ 'aria-current': 'page' }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}

export function Socials() {
  return (
    <ul className="socials" role="list">
      <li>
        {contact.instagram ? <a href={contact.instagram}>Instagram</a> : <Fill>Instagram link</Fill>}
      </li>
      <li>
        {contact.facebook ? <a href={contact.facebook}>Facebook</a> : <Fill>Facebook link</Fill>}
      </li>
    </ul>
  )
}

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer__mast" aria-hidden="true">
          Team Despond
        </p>
        <div className="footer__grid">
          <nav aria-label="Footer">
            <ul role="list" className="footer__links">
              <li>
                <Link to="/">Home</Link>
              </li>
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p>{contact.city}</p>
            <p>
              {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <Fill>studio email</Fill>}
            </p>
          </div>
          <Socials />
        </div>
        <p className="footer__legal">
          © {year} Team Despond
        </p>
        <p className="footer__credits" data-credits>
          Photographs:{' '}
          {credits().map((c, i, all) => (
            <span key={c!.href}>
              <a href={c!.href}>{c!.name}</a> ({c!.license}){i < all.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
      </div>
    </footer>
  )
}

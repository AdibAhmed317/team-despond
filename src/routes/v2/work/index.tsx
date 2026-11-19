import { createFileRoute, Link } from '@tanstack/react-router'
import { Photo } from '#/components/Photo'
import { useReveal } from '#/components/useReveal'
import { services } from '#/content/site'
import type { CategorySlug } from '#/content/site'
import { listProjects } from '#/server/content'

const slugs = services.map((s) => s.slug)

export const Route = createFileRoute('/v2/work/')({
  validateSearch: (s: Record<string, unknown>): { category?: CategorySlug } =>
    slugs.includes(s.category as CategorySlug) ? { category: s.category as CategorySlug } : {},
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ deps }) => listProjects({ data: { category: deps.category } }),
  head: () => ({ meta: [{ title: 'Work: Team Despond' }] }),
  component: Work,
})

function Work() {
  const projects = Route.useLoaderData()
  const { category } = Route.useSearch()
  const nameOf = (slug: string) => services.find((s) => s.slug === slug)?.name ?? slug
  useReveal(category)

  return (
    <>
      <section className="m-page-head">
        <div className="m-wrap">
          <h1>The work</h1>
          <nav className="m-segmented" aria-label="Filter by category">
            <Link to="/v2/work" search={{}} aria-current={!category ? 'page' : undefined}>
              All
            </Link>
            {services.map((s) => (
              <Link key={s.slug} to="/v2/work" search={{ category: s.slug }} aria-current={category === s.slug ? 'page' : undefined}>
                {s.short}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="m-section m-section--top0" aria-label="Projects">
        <div className="m-wrap">
          {projects.length ? (
            <ul className="m-grid" role="list">
              {projects.map((p, i) => (
                <li key={p.slug} className="m-dev" data-reveal style={{ '--i': i % 3 } as React.CSSProperties}>
                  <Link to="/v2/work/$slug" params={{ slug: p.slug }} className="m-tile">
                    <Photo photo={p.cover} slot={`v2-work-${p.slug}`} sizes="(min-width: 75rem) 400px, (min-width: 40rem) 50vw, 100vw" className="m-tile__photo" priority={i < 3} />
                    <span className="m-tile__title">{p.title}</span>
                    <span className="m-tile__meta">
                      <span>{nameOf(p.category)}</span>
                      {p.location ? <span>{p.location}</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="m-empty">
              <h2>Nothing in this category yet</h2>
              <p>New projects appear here as soon as the studio publishes them.</p>
              <Link to="/v2/work" search={{}} className="m-btn m-btn--secondary">
                See all work
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

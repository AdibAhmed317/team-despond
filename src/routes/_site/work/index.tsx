import { createFileRoute, Link } from '@tanstack/react-router'
import { Photo } from '#/components/Photo'
import { Reveal, RiseWords } from '#/components/motion'
import { Reel } from '#/components/Reel'
import { serviceBySlug, services } from '#/content/site'
import type { CategorySlug } from '#/content/site'
import { listProjects } from '#/server/content'

const slugs = services.map((s) => s.slug)

export const Route = createFileRoute('/_site/work/')({
  validateSearch: (s: Record<string, unknown>): { category?: CategorySlug } =>
    slugs.includes(s.category as CategorySlug) ? { category: s.category as CategorySlug } : {},
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ deps }) => listProjects({ data: { category: deps.category } }),
  head: () => ({
    meta: [
      { title: 'Work: Team Despond' },
      { name: 'description', content: 'Film, real estate, restaurant and product work by Team Despond, Sydney.' },
    ],
  }),
  component: Work,
})

function Work() {
  const projects = Route.useLoaderData()
  const { category } = Route.useSearch()
  const nameOf = (slug: string) => serviceBySlug(slug)?.name ?? slug

  return (
    <>
      <section className="page-head">
        <div className="container">
          <RiseWords as="h1" trigger="onLoad" text="The work" />
          <nav className="filters" aria-label="Filter by category">
            <Link to="/work" search={{}} className="filter" aria-current={!category ? 'page' : undefined}>
              All
            </Link>
            {services.map((s) => (
              <Link
                key={s.slug}
                to="/work"
                search={{ category: s.slug }}
                className="filter"
                aria-current={category === s.slug ? 'page' : undefined}
              >
                {s.short}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {!category ? <Reel projects={projects} nameOf={nameOf} /> : null}

      <section className="section section--top0" aria-label="Projects">
        <div className="container">
          {projects.length ? (
            <ul className="grid-work" role="list">
              {projects.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={(i % 3) * 0.08}>
                  <Link to="/work/$slug" params={{ slug: p.slug }} className="card">
                    <Photo
                      photo={p.cover}
                      slot={`work-${p.slug}`}
                      vt={`project-${p.slug}`}
                      want={`Cover frame for ${p.title}`}
                      sizes="(min-width: 60rem) 30vw, (min-width: 40rem) 50vw, 100vw"
                      className="card__photo"
                      priority={i < 3}
                    />
                    <h2 className="card__title">{p.title}</h2>
                    <p className="card__meta">
                      <span>{serviceBySlug(p.category)?.name}</span>
                      {p.location ? <span>{p.location}</span> : null}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <h2>Nothing in this category yet</h2>
              <p>New projects land here as soon as the studio publishes them.</p>
              <Link to="/work" search={{}} className="btn">
                See all work
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { Photo } from '#/components/Photo'
import { VideoEmbed } from '#/components/VideoEmbed'
import { serviceBySlug } from '#/content/site'
import { getProject } from '#/server/content'

export const Route = createFileRoute('/_site/work/$slug')({
  loader: ({ params }) => getProject({ data: params.slug }),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.title}: Team Despond` },
          { name: 'description', content: loaderData.project.summary },
          { property: 'og:image', content: loaderData.project.cover.src },
        ]
      : [],
  }),
  component: ProjectPage,
})

function ProjectPage() {
  const { project: p, next } = Route.useLoaderData()
  const service = serviceBySlug(p.category)
  const facts = [
    ['Category', service?.name],
    ['Client', p.client],
    ['Location', p.location],
    ['Services', p.services?.join(', ')],
    ['Year', p.year?.toString()],
  ].filter((f): f is [string, string] => !!f[1])

  return (
    <article>
      <header className="case-head">
        <Photo
          photo={p.cover}
          slot="case-cover"
          vt={`project-${p.slug}`}
          want={`The cover frame of ${p.title}`}
          className="case-head__photo"
          priority
        />
        <div className="container case-head__text">
          <p className="case-head__cat">
            <Link to="/work" search={{ category: p.category }}>
              {service?.name}
            </Link>
          </p>
          <h1>{p.title}</h1>
        </div>
      </header>

      <section className="section">
        <div className="container case-intro">
          <p className="case-intro__summary">{p.summary}</p>
          <dl className="sheet sheet--compact">
            {facts.map(([k, v]) => (
              <div key={k} className="sheet__row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {p.video ? (
        <section className="section section--top0" aria-label="Film">
          <div className="container">
            <VideoEmbed video={p.video} poster={p.cover} title={p.title} />
          </div>
        </section>
      ) : null}

      {p.gallery.length ? (
        <section className="section section--top0" aria-label="Gallery">
          <div className="container gallery">
            {p.gallery.map((g, i) => (
              <Photo
                key={g.src}
                photo={g}
                slot={`gallery-${i + 1}`}
                sizes="(min-width: 60rem) 66vw, 100vw"
                className={`gallery__item gallery__item--${(i % 3) + 1}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section well" aria-label="Next project">
        <div className="container next">
          <Link to="/work/$slug" params={{ slug: next.slug }} className="next__link">
            <span className="next__label">Next project</span>
            <span className="next__title">{next.title}</span>
          </Link>
          <Link to="/contact" search={{ service: p.category }} className="btn btn--primary">
            Start a project like this
          </Link>
        </div>
      </section>
    </article>
  )
}

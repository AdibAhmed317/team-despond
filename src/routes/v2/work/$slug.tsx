import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Photo } from '#/components/Photo'
import { VideoEmbed } from '#/components/VideoEmbed'
import { serviceBySlug } from '#/content/site'
import { getProject } from '#/server/content'

export const Route = createFileRoute('/v2/work/$slug')({
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
      <header className="m-page-head">
        <div className="m-wrap">
          <Link to="/v2/work" search={{ category: p.category }} className="m-link m-crumb">
            {service?.name}
          </Link>
          <h1>{p.title}</h1>
        </div>
      </header>
      <div className="m-wrap">
        <Photo photo={p.cover} slot="v2-case-cover" priority sizes="(min-width: 75rem) 1240px, 100vw" className="m-cover" />
        <div className="m-case-intro">
          <p className="m-case-intro__summary">{p.summary}</p>
          <dl className="m-facts m-facts--rows">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {p.video ? (
          <div className="m-video">
            <VideoEmbed video={p.video} poster={p.cover} title={p.title} />
          </div>
        ) : null}
        {p.gallery.length ? (
          <div className="m-gallery">
            {p.gallery.map((g, i) => (
              <Photo key={g.src} photo={g} slot={`v2-gallery-${i + 1}`} sizes="(min-width: 75rem) 820px, 100vw" className={`m-gallery__item m-gallery__item--${(i % 3) + 1}`} />
            ))}
          </div>
        ) : null}
      </div>
      <section className="m-section m-band" aria-label="Next project">
        <div className="m-wrap m-next">
          <Link to="/v2/work/$slug" params={{ slug: next.slug }} className="m-next__link">
            <span className="m-note">Next project</span>
            <span className="m-next__title">
              {next.title} <ArrowRight size={28} aria-hidden />
            </span>
          </Link>
          <Link to="/v2/contact" className="m-btn m-btn--primary">
            Start a project like this
          </Link>
        </div>
      </section>
    </article>
  )
}

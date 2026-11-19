import { createFileRoute, Link } from '@tanstack/react-router'
import { Photo } from '#/components/Photo'
import { listServices } from '#/server/content'

export const Route = createFileRoute('/v2/services')({
  loader: () => listServices(),
  head: () => ({ meta: [{ title: 'Services: Team Despond' }] }),
  component: Services,
})

function Services() {
  const services = Route.useLoaderData()
  return (
    <>
      <section className="m-page-head">
        <div className="m-wrap m-head">
          <h1>Four kinds of shoot</h1>
          <p className="m-lead">Film, property, food and product. Each one planned, shot and cut by the same crew.</p>
        </div>
      </section>
      <ol className="m-services" role="list">
        {services.map((s, i) => (
          <li key={s.slug} id={s.slug} className="m-service m-dev">
            <div className="m-wrap m-service__grid">
              <div className="m-service__text">
                <span className="m-service__n num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2>{s.name}</h2>
                <p className="m-lead">{s.summary}</p>
                <ul className="m-ruled" role="list">
                  {s.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <div className="m-actions">
                  <Link to="/v2/work" search={{ category: s.slug }} className="m-btn m-btn--secondary">
                    See the work
                  </Link>
                  <Link to="/v2/contact" search={{ service: s.slug }} className="m-link">
                    Ask about {s.short.toLowerCase()}
                  </Link>
                </div>
              </div>
              <Photo photo={s.photo} slot={`v2-services-${s.slug}`} sizes="(min-width: 75rem) 720px, 100vw" className="m-service__photo" priority={i === 0} />
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { Photo } from '#/components/Photo'
import { RiseWords } from '#/components/motion'
import { listServices } from '#/server/content'

export const Route = createFileRoute('/_site/services')({
  loader: () => listServices(),
  head: () => ({
    meta: [
      { title: 'Services: Team Despond' },
      { name: 'description', content: 'Film production, real estate, restaurant and café, and product photography and video in Sydney.' },
    ],
  }),
  component: Services,
})

function Services() {
  const services = Route.useLoaderData()

  return (
    <>
      <section className="page-head">
        <div className="container head-split">
          <RiseWords as="h1" trigger="onLoad" text="Four kinds of shoot" />
          <p className="lead">Film, property, food and product. Each one planned, shot and cut by the same crew.</p>
        </div>
      </section>

      <ol className="services" role="list">
        {services.map((s, i) => (
          <li key={s.slug} id={s.slug} className={`service service--${i % 2 ? 'b' : 'a'}`}>
            <div className="container service__grid">
              <Photo
                photo={s.photo}
                slot={`services-${s.slug}`}
                want={`Team Despond's own ${s.name.toLowerCase()} work`}
                sizes="(min-width: 60rem) 58vw, 100vw"
                className="service__photo"
                priority={i === 0}
              />
              <div className="service__text">
                <span className="service__n num" aria-hidden="true">
                  {i + 1}
                </span>
                <h2>{s.name}</h2>
                <p className="lead">{s.summary}</p>
                <ul className="ruled" role="list">
                  {s.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <div className="actions">
                  <Link to="/work" search={{ category: s.slug }} className="btn">
                    See the work
                  </Link>
                  <Link to="/contact" search={{ service: s.slug }} className="text-link">
                    Ask about {s.short.toLowerCase()}
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

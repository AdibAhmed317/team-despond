import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Suite } from '#/components/v2/Suite'
import { Photo } from '#/components/Photo'
import { EnquiryForm } from '#/components/EnquiryForm'
import { useReveal } from '#/components/useReveal'
import { contact } from '#/content/site'
import { listProjects, listServices } from '#/server/content'

export const Route = createFileRoute('/v2/')({
  loader: async () => {
    const [services, projects] = await Promise.all([listServices(), listProjects({ data: {} })])
    return { services, projects }
  },
  head: () => ({ meta: [{ title: 'Team Despond: film, photography and video, Sydney' }] }),
  component: Home,
})

const reasons = [
  ['Creative storytelling', 'Every shoot starts from the story the picture has to tell.'],
  ['Professional production', 'Planned, crewed, lit and edited as one job, not four.'],
  ['Attention to detail', 'The crumb on the plate, the line of the doorframe, the last frame.'],
  ['Tailored solutions', 'A brief shaped around your venue, property or product.'],
]

function Home() {
  const { services, projects } = Route.useLoaderData()
  const featured = projects.filter((p) => p.featured)
  const [lead, ...rest] = featured
  const nameOf = (slug: string) => services.find((s) => s.slug === slug)?.name ?? slug
  useReveal()

  return (
    <>
      <section className="m-hero" aria-labelledby="m-hero-head">
        <div className="m-wrap">
          <div className="m-hero__text">
            <h1 id="m-hero-head" className="m-settle">
              We create visual stories that make brands stand out.
            </h1>
            <div className="m-hero__foot">
              <p className="m-lead">
                From cinematic filmmaking to commercial photography and videography, we bring ideas to life through creative storytelling.
              </p>
              <div className="m-actions">
                <Link to="/v2/work" className="m-btn m-btn--primary">
                  Explore our work
                </Link>
                <Link to="/v2/contact" className="m-btn m-btn--secondary">
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
          <Suite projects={featured} services={services} />
        </div>
      </section>

      <section className="m-section" aria-labelledby="m-services-head">
        <div className="m-wrap">
          <div className="m-head">
            <h2 id="m-services-head">Four kinds of shoot</h2>
            <p className="m-lead">One crew for film, property, food and product, from the first call to the final cut.</p>
          </div>
          <ul className="m-cards" role="list">
            {services.map((s, i) => (
              <li key={s.slug} className="m-card m-dev" data-reveal style={{ '--i': i } as React.CSSProperties}>
                <Photo photo={s.photo} slot={`v2-service-${s.slug}`} sizes="(min-width: 75rem) 300px, (min-width: 40rem) 50vw, 100vw" className="m-card__photo" />
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
                <Link to="/v2/services" hash={s.slug} className="m-card__link">
                  View more<span className="m-sr"> about {s.name.toLowerCase()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {lead ? (
        <section className="m-section m-band" aria-labelledby="m-case-head">
          <div className="m-wrap">
            <div className="m-head">
              <h2 id="m-case-head">Selected work</h2>
              <Link to="/v2/work" className="m-link">
                Every project <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <article className="m-case m-dev">
              <Link to="/v2/work/$slug" params={{ slug: lead.slug }} className="m-case__photo-link" tabIndex={-1} aria-hidden="true">
                <Photo photo={lead.cover} slot="v2-case-lead" sizes="(min-width: 75rem) 820px, 100vw" className="m-case__photo" />
              </Link>
              <div className="m-case__text">
                <h3>
                  <Link to="/v2/work/$slug" params={{ slug: lead.slug }}>
                    {lead.title}
                  </Link>
                </h3>
                <p>{lead.summary}</p>
                <dl className="m-facts">
                  <div>
                    <dt>Category</dt>
                    <dd>{nameOf(lead.category)}</dd>
                  </div>
                  {lead.location ? (
                    <div>
                      <dt>Location</dt>
                      <dd>{lead.location}</dd>
                    </div>
                  ) : null}
                  {lead.services?.length ? (
                    <div>
                      <dt>Services</dt>
                      <dd>{lead.services.join(', ')}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </article>
            {rest.length ? (
              <ul className="m-rows" role="list">
                {rest.map((p) => (
                  <li key={p.slug}>
                    <Link to="/v2/work/$slug" params={{ slug: p.slug }} className="m-row">
                      <span className="m-row__title">{p.title}</span>
                      <span className="m-row__meta">{nameOf(p.category)}</span>
                      <span className="m-row__meta">{p.location ?? ''}</span>
                      <ArrowRight size={18} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="m-section" aria-labelledby="m-about-head">
        <div className="m-wrap m-statement">
          <h2 id="m-about-head">A Sydney crew for film, property, food and product, telling each one as a story.</h2>
          <p>
            Team Despond is a creative production and visual media studio. We plan, shoot and cut the pictures brands sell with.{' '}
            <Link to="/v2/about" className="m-link">
              About the studio
            </Link>
          </p>
        </div>
      </section>

      <section className="m-section m-section--tight" aria-labelledby="m-why-head">
        <div className="m-wrap m-split-rows">
          <h2 id="m-why-head">Why book us</h2>
          <dl className="m-sheet">
            {reasons.map(([t, l]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="m-section m-band" id="enquire" aria-labelledby="m-enquire-head">
        <div className="m-wrap m-form-split">
          <div>
            <h2 id="m-enquire-head">Have a project in mind?</h2>
            <p className="m-lead">Tell us what you are making. We come back with a plan and a quote.</p>
            <p className="m-note">
              {contact.city}
              {contact.email ? (
                <>
                  {' '}
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </>
              ) : null}
            </p>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </>
  )
}

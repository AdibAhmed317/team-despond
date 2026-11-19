import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Hero } from '#/components/Hero'
import { Photo } from '#/components/Photo'
import { EnquiryForm } from '#/components/EnquiryForm'
import { Fill, Socials } from '#/components/Chrome'
import { useReveal } from '#/components/useReveal'
import { contact, serviceBySlug } from '#/content/site'
import type { Project } from '#/content/site'
import { listProjects, listServices } from '#/server/content'

export const Route = createFileRoute('/_v1/')({
  loader: async () => {
    const [services, featured] = await Promise.all([listServices(), listProjects({ data: { featured: true } })])
    return { services, featured }
  },
  component: Home,
})

const reasons = [
  { title: 'Creative storytelling', line: 'Every shoot starts from the story the picture has to tell.' },
  { title: 'Professional production', line: 'Planned, crewed, lit and edited as one job, not four.' },
  { title: 'Attention to detail', line: 'The crumb on the plate, the line of the doorframe, the last frame.' },
  { title: 'Tailored solutions', line: 'A brief shaped around your venue, property or product.' },
]

function Home() {
  const { services, featured } = Route.useLoaderData()
  useReveal()

  return (
    <>
      <Hero services={services} />

      <section className="section" aria-labelledby="services-head">
        <div className="container">
          <div className="head-split">
            <h2 id="services-head">What we shoot</h2>
            <p className="lead">Four kinds of work, one crew from the first call to the final cut.</p>
          </div>
          <ol className="bento" role="list">
            {services.map((s, i) => (
              <li key={s.slug} className="tile" data-reveal style={{ '--i': i } as React.CSSProperties}>
                <Photo
                  photo={s.photo}
                  slot={`service-${s.slug}`}
                  want={`Team Despond's own ${s.name.toLowerCase()} work`}
                  sizes="(min-width: 60rem) 60vw, 100vw"
                  className="tile__photo"
                />
                <div className="tile__body">
                  <span className="tile__n num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{s.name}</h3>
                  <p>{s.summary}</p>
                  <Link to="/services" hash={s.slug} className="tile__link">
                    View more<span className="visually-hidden"> about {s.name.toLowerCase()}</span>
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FeaturedWork projects={featured} />

      <section className="section well grained" aria-labelledby="about-head">
        <div className="container statement">
          <h2 id="about-head" className="statement__line">
            A Sydney crew for film, property, food and product, telling each one as a story.
          </h2>
          <div className="statement__foot">
            <p>
              Team Despond is a creative production and visual media studio. We plan, shoot and cut the pictures
              brands sell with.
            </p>
            <Link to="/about" className="text-link">
              About the studio
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="why-head">
        <div className="container sheet-wrap">
          <h2 id="why-head">Why book us</h2>
          <dl className="sheet">
            {reasons.map((r) => (
              <div key={r.title} className="sheet__row">
                <dt>{r.title}</dt>
                <dd>{r.line}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section section--close" id="enquire" aria-labelledby="enquire-head">
        <div className="container form-split">
          <div className="form-split__head">
            <h2 id="enquire-head">Have a project in mind?</h2>
            <p className="lead">Tell us what you are making. We come back with a plan and a quote.</p>
            <dl className="facts">
              <div>
                <dt>Studio</dt>
                <dd>{contact.city}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <Fill>studio email</Fill>}</dd>
              </div>
              <div>
                <dt>Follow</dt>
                <dd>
                  <Socials />
                </dd>
              </div>
            </dl>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </>
  )
}

function FeaturedWork({ projects }: { projects: Project[] }) {
  const [lit, setLit] = useState(0)
  if (!projects.length) return null

  return (
    <section className="section section--l" aria-labelledby="work-head">
      <div className="container">
        <div className="head-split">
          <h2 id="work-head">Selected work</h2>
          <Link to="/work" className="text-link">
            Every project
          </Link>
        </div>
        <div className="index">
          <div className="index__preview" aria-hidden="true">
            {projects.map((p, i) => (
              <Photo
                key={p.slug}
                photo={p.cover}
                slot={`featured-${i + 1}`}
                want={`Cover frame of a featured project: ${p.title}`}
                sizes="(min-width: 60rem) 55vw, 1px"
                className={i === lit ? 'index__frame is-on' : 'index__frame'}
              />
            ))}
          </div>
          <ol className="index__rows" role="list">
            {projects.map((p, i) => (
              <li key={p.slug} className="index__row" aria-current={i === lit || undefined}>
                <Link
                  to="/work/$slug"
                  params={{ slug: p.slug }}
                  className="index__link"
                  onPointerEnter={() => setLit(i)}
                  onFocus={() => setLit(i)}
                >
                  <Photo photo={p.cover} slot={`featured-${i + 1}-m`} sizes="100vw" className="index__thumb" />
                  <span className="index__n num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="index__title">{p.title}</span>
                  <span className="index__meta">{serviceBySlug(p.category)?.name}</span>
                  <span className="index__meta">{p.location ?? ''}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

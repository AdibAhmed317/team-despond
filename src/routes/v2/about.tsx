import { createFileRoute, Link } from '@tanstack/react-router'
import { Photo } from '#/components/Photo'
import { photos, services } from '#/content/site'

export const Route = createFileRoute('/v2/about')({
  head: () => ({ meta: [{ title: 'About: Team Despond' }] }),
  component: About,
})

const reasons = [
  ['Creative storytelling', 'Every shoot starts from the story the picture has to tell.'],
  ['Professional production', 'Planned, crewed, lit and edited as one job, not four.'],
  ['Attention to detail', 'The crumb on the plate, the line of the doorframe, the last frame.'],
  ['Tailored solutions', 'A brief shaped around your venue, property or product.'],
]

function About() {
  return (
    <>
      <section className="m-page-head">
        <div className="m-wrap m-about">
          <div>
            <h1>Pictures that do a job</h1>
            <p className="m-lead">
              Team Despond is a creative production and visual media studio in Sydney. We make film, photography and video for brands that sell on how they look.
            </p>
          </div>
          <div className="m-dev">
            <Photo photo={photos.cameraCrew} slot="v2-about-crew" sizes="(min-width: 75rem) 560px, 100vw" className="m-about__photo" priority />
          </div>
        </div>
      </section>
      <section className="m-section m-band" aria-labelledby="m-why">
        <div className="m-wrap m-split-rows">
          <h2 id="m-why">How we work</h2>
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
      <section className="m-section" aria-labelledby="m-make">
        <div className="m-wrap m-split-rows">
          <h2 id="m-make">What we make</h2>
          <dl className="m-sheet">
            {services.map((s) => (
              <div key={s.slug}>
                <dt>
                  <Link to="/v2/services" hash={s.slug}>
                    {s.name}
                  </Link>
                </dt>
                <dd>{s.deliverables.join(', ')}.</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}

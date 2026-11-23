import { createFileRoute, Link } from '@tanstack/react-router'
import { Photo } from '#/components/Photo'
import { RiseWords } from '#/components/motion'
import { photos, services } from '#/content/site'

export const Route = createFileRoute('/_site/about')({
  head: () => ({
    meta: [
      { title: 'About: Team Despond' },
      { name: 'description', content: 'Team Despond is a creative production and visual media studio based in Sydney.' },
    ],
  }),
  component: About,
})

// shortcut: the stages below are the usual shape of a shoot, written as a
// draft; Team Despond confirms or rewrites them before launch.
const stages = [
  { title: 'Brief', line: 'What the pictures have to do, for whom, and where they will run.' },
  { title: 'Plan', line: 'Locations, shot list, crew and schedule, agreed before the day.' },
  { title: 'Shoot', line: 'Camera, drone and light on the day, with you on set if you like.' },
  { title: 'Finish', line: 'Grade, edit and delivery in the sizes each channel needs.' },
]

function About() {
  return (
    <>
      <section className="page-head page-head--split">
        <div className="container about-head">
          <div>
            <RiseWords as="h1" trigger="onLoad" text="Pictures that do a job" />
            <p className="lead">
              Team Despond is a creative production and visual media studio in Sydney. We make film, photography and
              video for brands that sell on how they look.
            </p>
          </div>
          <Photo
            photo={photos.cameraCrew}
            slot="about-crew"
            want="The Team Despond crew at work on a shoot"
            sizes="(min-width: 60rem) 50vw, 100vw"
            className="about-head__photo"
            priority
          />
        </div>
      </section>

      <section className="section" aria-labelledby="approach-head">
        <div className="container">
          <RiseWords id="approach-head" text="How a shoot runs" />
          <ol className="steps" role="list">
            {stages.map((s, i) => (
              <li key={s.title}>
                <span className="steps__n num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section well grained" aria-labelledby="cap-head">
        <div className="container sheet-wrap">
          <RiseWords id="cap-head" text="What we make" />
          <dl className="sheet">
            {services.map((s) => (
              <div key={s.slug} className="sheet__row">
                <dt>
                  <Link to="/services" hash={s.slug}>
                    {s.name}
                  </Link>
                </dt>
                <dd>{s.deliverables.join(', ')}.</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section section--close">
        <div className="container cta-line">
          <h2>Have a project in mind?</h2>
          <Link to="/contact" className="btn btn--primary">
            Let’s work together
          </Link>
        </div>
      </section>
    </>
  )
}

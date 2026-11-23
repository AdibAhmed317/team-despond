import { createFileRoute } from '@tanstack/react-router'
import { EnquiryForm } from '#/components/EnquiryForm'
import { RiseWords } from '#/components/motion'
import { Fill, Socials } from '#/components/Chrome'
import { contact, services } from '#/content/site'
import type { CategorySlug } from '#/content/site'

const slugs = services.map((s) => s.slug)

export const Route = createFileRoute('/_site/contact')({
  validateSearch: (s: Record<string, unknown>): { service?: CategorySlug } =>
    slugs.includes(s.service as CategorySlug) ? { service: s.service as CategorySlug } : {},
  head: () => ({
    meta: [
      { title: 'Contact: Team Despond' },
      { name: 'description', content: 'Send Team Despond a project enquiry for film, real estate, restaurant or product work in Sydney.' },
    ],
  }),
  component: Contact,
})

function Contact() {
  const { service } = Route.useSearch()
  return (
    <section className="page-head page-head--form" aria-labelledby="contact-head">
      <div className="container form-split">
        <div className="form-split__head">
          <RiseWords as="h1" id="contact-head" trigger="onLoad" text="Let’s work together" />
          <p className="lead">Tell us what you are making, where, and roughly when.</p>
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
              <dt>Phone</dt>
              <dd>{contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : <Fill>studio phone</Fill>}</dd>
            </div>
            <div>
              <dt>Follow</dt>
              <dd>
                <Socials />
              </dd>
            </div>
          </dl>
        </div>
        <EnquiryForm service={service} />
      </div>
    </section>
  )
}

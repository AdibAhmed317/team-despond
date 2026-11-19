import { createFileRoute } from '@tanstack/react-router'
import { EnquiryForm } from '#/components/EnquiryForm'
import { contact, services } from '#/content/site'
import type { CategorySlug } from '#/content/site'

const slugs = services.map((s) => s.slug)

export const Route = createFileRoute('/v2/contact')({
  validateSearch: (s: Record<string, unknown>): { service?: CategorySlug } =>
    slugs.includes(s.service as CategorySlug) ? { service: s.service as CategorySlug } : {},
  head: () => ({ meta: [{ title: 'Contact: Team Despond' }] }),
  component: Contact,
})

function Contact() {
  const { service } = Route.useSearch()
  const gap = (s: string) => <span className="m-gap">{s}</span>
  return (
    <section className="m-page-head m-page-head--form">
      <div className="m-wrap m-form-split">
        <div>
          <h1>Let’s work together</h1>
          <p className="m-lead">Tell us what you are making, where, and roughly when.</p>
          <dl className="m-facts m-facts--rows">
            <div>
              <dt>Studio</dt>
              <dd>{contact.city}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : gap('studio email')}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : gap('studio phone')}</dd>
            </div>
            <div>
              <dt>Follow</dt>
              <dd>
                {contact.instagram ? <a href={contact.instagram}>Instagram</a> : gap('Instagram link')}{' '}
                {contact.facebook ? <a href={contact.facebook}>Facebook</a> : gap('Facebook link')}
              </dd>
            </div>
          </dl>
        </div>
        <EnquiryForm service={service} />
      </div>
    </section>
  )
}

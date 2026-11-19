import { useState } from 'react'
import { services } from '#/content/site'
import type { CategorySlug } from '#/content/site'
import { checkEnquiry, sendEnquiry } from '#/server/enquiry'
import type { Enquiry } from '#/server/enquiry'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; text: string }

const empty: Enquiry = { name: '', business: '', email: '', phone: '', service: '', message: '' }

export function EnquiryForm({ service }: { service?: CategorySlug }) {
  const [values, setValues] = useState<Enquiry>({ ...empty, service: service ?? '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Enquiry, string>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const set = (k: keyof Enquiry) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = checkEnquiry(values)
    setErrors(found)
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0]
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const r = await sendEnquiry({ data: values })
      if (r.ok) setStatus({ kind: 'done' })
      else if (r.reason === 'invalid') {
        setErrors(r.fields)
        setStatus({ kind: 'idle' })
      } else setStatus({ kind: 'error', text: 'Nothing was sent: this form is not connected to the studio inbox yet.' })
    } catch {
      setStatus({ kind: 'error', text: 'That did not go through. Try again in a minute.' })
    }
  }

  if (status.kind === 'done') {
    return (
      <div className="form-done" role="status">
        <h3>Thanks, {values.name.split(' ')[0]}.</h3>
        <p>Your brief is with the studio. The reply goes to {values.email}.</p>
      </div>
    )
  }

  const field = (k: keyof Enquiry) => ({
    id: `enq-${k}`,
    name: k,
    value: values[k] ?? '',
    onChange: set(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `enq-${k}-err` : undefined,
  })
  const err = (k: keyof Enquiry) =>
    errors[k] ? (
      <p className="field__err" id={`enq-${k}-err`}>
        {errors[k]}
      </p>
    ) : null

  return (
    <form className="enquiry" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="enq-name">Full name</label>
        <input {...field('name')} autoComplete="name" required />
        {err('name')}
      </div>
      <div className="field">
        <label htmlFor="enq-business">
          Business name <span className="field__opt">optional</span>
        </label>
        <input {...field('business')} autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="enq-email">Email address</label>
        <input {...field('email')} type="email" autoComplete="email" required />
        {err('email')}
      </div>
      <div className="field">
        <label htmlFor="enq-phone">Phone number</label>
        <input {...field('phone')} type="tel" autoComplete="tel" required />
        {err('phone')}
      </div>
      <div className="field field--wide">
        <label htmlFor="enq-service">Service required</label>
        <select {...field('service')} required>
          <option value="" disabled>
            Choose a service
          </option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        {err('service')}
      </div>
      <div className="field field--wide">
        <label htmlFor="enq-message">Project description</label>
        <textarea {...field('message')} rows={5} required />
        {err('message')}
      </div>
      <div className="field--wide enquiry__send">
        <button className="btn btn--primary" type="submit" aria-busy={status.kind === 'sending' || undefined} disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending' : 'Let’s work together'}
        </button>
        <p className="enquiry__status" aria-live="polite">
          {status.kind === 'error' ? status.text : ''}
        </p>
      </div>
    </form>
  )
}

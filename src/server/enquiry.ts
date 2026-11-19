import { createServerFn } from '@tanstack/react-start'
import type { CategorySlug } from '#/content/site'

export type Enquiry = {
  name: string
  business?: string
  email: string
  phone: string
  service: CategorySlug | ''
  message: string
}

export type EnquiryResult =
  | { ok: true }
  | { ok: false; reason: 'invalid'; fields: Partial<Record<keyof Enquiry, string>> }
  | { ok: false; reason: 'not-connected' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function checkEnquiry(e: Enquiry) {
  const fields: Partial<Record<keyof Enquiry, string>> = {}
  if (!e.name.trim()) fields.name = 'Add your name so we know who to reply to.'
  if (!EMAIL.test(e.email.trim())) fields.email = 'That address looks incomplete. Write it as name@example.com.'
  if (e.phone.replace(/\D/g, '').length < 8) fields.phone = 'Add a phone number with its area code.'
  if (!e.service) fields.service = 'Pick the service closest to your project.'
  if (e.message.trim().length < 10) fields.message = 'A line or two about the project helps us quote.'
  return fields
}

export const sendEnquiry = createServerFn({ method: 'POST' })
  .validator((e: Enquiry) => e)
  .handler(async ({ data }): Promise<EnquiryResult> => {
    const fields = checkEnquiry(data)
    if (Object.keys(fields).length) return { ok: false, reason: 'invalid', fields }
    // shortcut: delivery to Team Despond's inbox lands with the Cloudflare
    // email binding; until then the form says plainly that nothing was sent.
    return { ok: false, reason: 'not-connected' }
  })

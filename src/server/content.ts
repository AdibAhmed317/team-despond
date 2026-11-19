import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { projects, services } from '#/content/site'
import type { CategorySlug } from '#/content/site'

// The one seam between the pages and the data. Today it reads the seed in
// src/content/site.ts; the admin build swaps these bodies for D1 queries.

export const listServices = createServerFn({ method: 'GET' }).handler(async () => services)

export const listProjects = createServerFn({ method: 'GET' })
  .validator((input: { category?: CategorySlug; featured?: boolean } | undefined) => input ?? {})
  .handler(async ({ data }) =>
    projects.filter(
      (p) =>
        (!data.category || p.category === data.category) &&
        (data.featured === undefined || p.featured === data.featured),
    ),
  )

export const getProject = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const index = projects.findIndex((p) => p.slug === slug)
    if (index === -1) throw notFound()
    return { project: projects[index], next: projects[(index + 1) % projects.length] }
  })

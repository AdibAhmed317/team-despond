import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import appCss from '../styles.css?url'

const Devtools = import.meta.env.DEV ? lazy(() => import('#/components/Devtools')) : () => null

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#0f0c0a' },
      { title: 'Team Despond: film, photography and video, Sydney' },
      {
        name: 'description',
        content:
          'Team Despond is a Sydney production studio for film, real estate, restaurant and café, and product photography and video.',
      },
      { property: 'og:site_name', content: 'Team Despond' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:wght@200;400&family=Barlow:wght@300;400&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
  component: () => <Outlet />,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <section className="page-head">
      <div className="container">
        <h1>Out of frame</h1>
        <p className="lead">That page is not here. The work is.</p>
        <div className="actions">
          <Link to="/work" className="btn">
            See the work
          </Link>
        </div>
      </div>
    </section>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Suspense>
          <Devtools />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}

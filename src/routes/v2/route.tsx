import { createFileRoute, Outlet } from '@tanstack/react-router'
import { V2Footer, V2Nav } from '#/components/v2/Chrome'
import v2Css from '#/v2.css?url'

// v2 design (Hallmark "Midnight"): its own chrome, faces and stylesheet.
// Tokens are redefined on .m-root, so shared components (Photo, EnquiryForm)
// pick up the v2 palette without changes.
export const Route = createFileRoute('/v2')({
  head: () => ({
    meta: [{ name: 'theme-color', content: '#0b1022' }],
    links: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@100..125,300..500&display=swap' },
      { rel: 'stylesheet', href: v2Css },
    ],
  }),
  component: V2Layout,
})

function V2Layout() {
  return (
    <div className="m-root" data-theme="midnight">
      <V2Nav />
      <main id="m-main">
        <Outlet />
      </main>
      <V2Footer />
    </div>
  )
}

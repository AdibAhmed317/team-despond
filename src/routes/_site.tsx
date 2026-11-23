import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SiteFooter, SiteNav } from '#/components/Chrome'
import { MotionProvider } from '#/components/motion'

// Public site layout: the nav and footer around every page.
export const Route = createFileRoute('/_site')({
  component: () => (
    <MotionProvider>
      <SiteNav />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </MotionProvider>
  ),
})

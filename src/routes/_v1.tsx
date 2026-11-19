import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SiteFooter, SiteNav } from '#/components/Chrome'

// v1 (Darkroom) layout: the original site at /. v2 lives at /v2 with its own chrome.
export const Route = createFileRoute('/_v1')({
  component: () => (
    <>
      <SiteNav />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  ),
})

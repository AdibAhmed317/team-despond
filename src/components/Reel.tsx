import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMotionValueEvent, useScroll } from 'motion/react'
import type { Project } from '#/content/site'

// The reel: every frame of the portfolio on a curved wall, the way a cinema
// screen wraps a room. The section pins while you scroll; scroll pans the wall,
// the pointer tilts it a few degrees, hover lifts a frame and names its
// project, click opens it. three.js loads only here, renders only while the
// section is on screen, and is skipped on touch, small screens and for
// reduced motion (the grid below covers everything the reel shows).

type Frame = { slug: string; title: string; category: string; src: string; aspect: number }

const RADIUS = 7
const HEIGHT = 2.2
const GAP = 0.5

export function Reel(props: { projects: Project[]; nameOf: (slug: string) => string }) {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    setEnabled(
      window.matchMedia('(min-width: 64rem) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        !!document.createElement('canvas').getContext('webgl2'),
    )
  }, [])
  return enabled ? <ReelStage {...props} /> : null
}

function ReelStage({ projects, nameOf }: { projects: Project[]; nameOf: (slug: string) => string }) {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [hover, setHover] = useState<Frame | null>(null)
  const progress = useRef(0)
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v
  })

  const frames: Frame[] = projects.flatMap((p) =>
    [p.cover, ...p.gallery].map((ph) => ({
      slug: p.slug,
      title: p.title,
      category: nameOf(p.category),
      src: ph.src.replace('/1280px-', '/960px-'),
      aspect: Math.min(1.7, Math.max(0.72, ph.width / ph.height)),
    })),
  )

  useEffect(() => {
    if (!canvas.current || !section.current) return
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const THREE = await import('three')
      if (disposed || !canvas.current) return
      const el = canvas.current
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.outputColorSpace = THREE.SRGBColorSpace
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40)
      const wall = new THREE.Group()
      scene.add(wall)

      // Lay the frames edge to edge along the arc.
      const loader = new THREE.TextureLoader()
      loader.setCrossOrigin('anonymous')
      const meshes: { mesh: InstanceType<typeof THREE.Mesh>; frame: Frame; angle: number; lift: number }[] = []
      let arc = 0
      const geometries: InstanceType<typeof THREE.PlaneGeometry>[] = []
      const materials: InstanceType<typeof THREE.MeshBasicMaterial>[] = []
      for (const f of frames) {
        const w = HEIGHT * f.aspect
        const angle = (arc + w / 2) / RADIUS
        arc += w + GAP
        const geo = new THREE.PlaneGeometry(w, HEIGHT)
        // Until its photo arrives a frame shows as a lit panel, a step above the ground.
        const mat = new THREE.MeshBasicMaterial({ color: 0x2a2420 })
        geometries.push(geo)
        materials.push(mat)
        loader.load(f.src, (tex) => {
          if (disposed) return tex.dispose()
          tex.colorSpace = THREE.SRGBColorSpace
          tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
          mat.map = tex
          mat.color.set(0xffffff)
          mat.needsUpdate = true
        })
        const mesh = new THREE.Mesh(geo, mat)
        wall.add(mesh)
        meshes.push({ mesh, frame: f, angle, lift: 0 })
      }
      const total = arc / RADIUS
      for (const m of meshes) {
        m.mesh.position.set(Math.sin(m.angle) * RADIUS, 0, -Math.cos(m.angle) * RADIUS)
        m.mesh.rotation.y = -m.angle
      }

      // Size, pointer, hover.
      const size = () => {
        const r = el.getBoundingClientRect()
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
        renderer.setSize(r.width, r.height, false)
        camera.aspect = r.width / r.height
        camera.updateProjectionMatrix()
      }
      size()
      const ro = new ResizeObserver(size)
      ro.observe(el)

      const pointer = new THREE.Vector2(0, 0)
      const tilt = { x: 0, y: 0 }
      const ray = new THREE.Raycaster()
      let hovered: (typeof meshes)[number] | null = null
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      }
      const onLeave = () => pointer.set(0, 0)
      const onClick = () => hovered && navigate({ to: '/work/$slug', params: { slug: hovered.frame.slug } })
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      el.addEventListener('click', onClick)

      // Draw only while the reel is on screen.
      let visible = false
      let raf = 0
      let pan = 0
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(tick)
      })
      io.observe(section.current!)

      const view = 0.55 // radians of the wall in front of the camera
      function tick() {
        raf = 0
        if (disposed || !visible) return
        // pan = the wall angle facing the camera; it sweeps from the first frames to the last.
        const target = view * 0.4 + progress.current * Math.max(0, total - view * 0.8)
        pan += (target - pan) * 0.12
        // Rotating the wall by +pan puts the frame at angle pan straight ahead (world angle = angle - pan).
        wall.rotation.y = pan
        tilt.x += (pointer.y * 0.06 - tilt.x) * 0.08
        tilt.y += (pointer.x * 0.08 - tilt.y) * 0.08
        camera.rotation.set(tilt.x, -tilt.y, 0)

        ray.setFromCamera(pointer, camera)
        const hit = pointer.lengthSq() > 0 ? ray.intersectObjects(meshes.filter((m) => m.mesh.visible).map((m) => m.mesh))[0] : undefined
        const next = hit ? meshes.find((m) => m.mesh === hit.object) ?? null : null
        if (next !== hovered) {
          hovered = next
          setHover(next?.frame ?? null)
          el.style.cursor = next ? 'pointer' : ''
        }
        for (const m of meshes) {
          m.lift += ((m === hovered ? 1 : 0) - m.lift) * 0.14
          // The reel is longer than one turn of the circle: draw only the half-turn facing the camera.
          m.mesh.visible = Math.abs(m.angle - pan) < Math.PI * 0.8
          // Hover pulls the frame toward the viewer along its own normal.
          const r = RADIUS - m.lift * 0.45
          m.mesh.position.set(Math.sin(m.angle) * r, 0, -Math.cos(m.angle) * r)
          // Frames fall into shadow as they turn away from the camera.
          const mat = m.mesh.material as InstanceType<typeof THREE.MeshBasicMaterial>
          if (mat.map) mat.color.setScalar(Math.max(0.22, 1 - Math.max(0, Math.abs(m.angle - pan) - 0.42) * 1.4))
        }
        renderer.render(scene, camera)
        raf = requestAnimationFrame(tick)
      }
      setReady(true)

      cleanup = () => {
        cancelAnimationFrame(raf)
        io.disconnect()
        ro.disconnect()
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
        el.removeEventListener('click', onClick)
        materials.forEach((m) => (m.map?.dispose(), m.dispose()))
        geometries.forEach((g) => g.dispose())
        renderer.dispose()
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <section ref={section} className="reel" aria-label="The reel: every frame of the portfolio">
      <div className="reel__stage">
        <canvas ref={canvas} className="reel__canvas" data-ready={ready || undefined} aria-hidden="true" />
        <div className="container reel__ui">
          <p className="reel__hint">Scroll to move through the reel. Click a frame to open it.</p>
          <p className="reel__now" aria-live="polite">
            {hover ? (
              <>
                <span className="reel__title">{hover.title}</span>
                <span className="reel__cat">{hover.category}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  )
}

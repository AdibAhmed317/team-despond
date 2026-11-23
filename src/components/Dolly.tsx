import { Fragment, useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import type { Photo } from '#/content/site'
import { useCinema } from '#/components/motion'

// The dolly: the home page statement, shot as a push-in. The section pins and
// scroll drives a camera forward through the studio's frames hanging in the
// dark; the statement lights word by word as the camera travels, then the link
// arrives. Same rules as the reel: three.js loads only here, draws only while on
// screen, and anywhere the reel is skipped the plain statement shows instead.

const DEPTH = 3.4 // z distance between consecutive frames
const FRAME_H = 1.25

type Props = {
  id: string
  line: string
  photos: Photo[]
  /** The plain section, shown on the server, on touch, small screens and for reduced motion. */
  fallback: React.ReactNode
  foot: React.ReactNode
}

export function Dolly(props: Props) {
  return useCinema() ? <DollyStage {...props} /> : props.fallback
}

// Deterministic scatter so the layout is the same on every visit.
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function DollyStage({ id, line, photos, foot }: Props) {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const progress = useRef(0)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v
    // Words light across the first 70% of the travel; the foot arrives after.
    section.current?.style.setProperty('--t', String(Math.min(1, Math.max(0, (v - 0.04) / 0.66))))
    section.current?.style.setProperty('--f', String(Math.min(1, Math.max(0, (v - 0.74) / 0.12))))
  })

  const words = line.split(' ')

  useEffect(() => {
    if (!canvas.current || !section.current) return
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const THREE = await import('three')
      if (disposed || !canvas.current || !section.current) return
      const el = canvas.current
      const host = section.current

      // The ground colour comes from the CSS token, resolved through a 1px canvas
      // so oklch() works whatever the browser reports.
      const probe = document.createElement('canvas').getContext('2d')!
      probe.fillStyle = getComputedStyle(el.parentElement!).backgroundColor
      probe.fillRect(0, 0, 1, 1)
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
      const ground = new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)

      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: false, powerPreference: 'high-performance' })
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(ground)
      const scene = new THREE.Scene()
      scene.fog = new THREE.Fog(ground, 5, 24)
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40)

      const loader = new THREE.TextureLoader()
      loader.setCrossOrigin('anonymous')
      const frames: { mesh: InstanceType<typeof THREE.Mesh>; mat: InstanceType<typeof THREE.MeshBasicMaterial>; z: number; drift: number }[] = []
      const geometries: InstanceType<typeof THREE.PlaneGeometry>[] = []
      photos.forEach((ph, i) => {
        const aspect = Math.min(1.6, Math.max(0.72, ph.width / ph.height))
        const geo = new THREE.PlaneGeometry(FRAME_H * aspect, FRAME_H)
        const mat = new THREE.MeshBasicMaterial({ color: 0x2a2420, transparent: true })
        loader.load(ph.src.replace('/1280px-', '/960px-'), (tex) => {
          if (disposed) return tex.dispose()
          tex.colorSpace = THREE.SRGBColorSpace
          tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
          mat.map = tex
          mat.color.set(0xffffff)
          mat.needsUpdate = true
        })
        // Frames hang around a line of travel set right of the words, never on it, so the type stays clear.
        const a = i * 2.39996 + rand(i + 1) * 0.6 // golden angle, jittered
        const radius = 2.1 + rand(i + 7) * 1.3
        const mesh = new THREE.Mesh(geo, mat)
        const z = -2 - i * DEPTH
        // x never goes left of 0.9, so from the lens every frame sits right of the type.
        mesh.position.set(0.9 + (Math.cos(a) * 0.5 + 0.5) * radius * 1.5, Math.sin(a) * radius * 0.62, z)
        // Turned a little toward the lens, as if hung for someone walking the aisle.
        mesh.rotation.y = -Math.sign(mesh.position.x - 2.6) * (0.18 + rand(i + 3) * 0.2)
        geometries.push(geo)
        scene.add(mesh)
        frames.push({ mesh, mat, z, drift: rand(i + 11) * Math.PI * 2 })
      })
      const start = 6
      // Stop short of the last frames so the shot ends on a full wall, not an empty room.
      const end = -2 - (photos.length - 1) * DEPTH + 9

      const size = () => {
        const rect = el.getBoundingClientRect()
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
        renderer.setSize(rect.width, rect.height, false)
        camera.aspect = rect.width / rect.height
        camera.updateProjectionMatrix()
      }
      size()
      const ro = new ResizeObserver(size)
      ro.observe(el)

      const pointer = { x: 0, y: 0 }
      const onMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1
      }
      window.addEventListener('pointermove', onMove, { passive: true })

      let visible = false
      let raf = 0
      let camZ = start
      const sway = { x: 0, y: 0 }
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(tick)
      })
      io.observe(host)

      function tick(now: number) {
        raf = 0
        if (disposed || !visible) return
        camZ += (start + (end - start) * progress.current - camZ) * 0.09
        sway.x += (pointer.x * 0.35 - sway.x) * 0.05
        sway.y += (-pointer.y * 0.2 - sway.y) * 0.05
        camera.position.set(sway.x, sway.y, camZ)
        camera.lookAt(sway.x * 0.3, sway.y * 0.3, camZ - 10)
        const s = now / 1000
        for (const f of frames) {
          const d = camZ - f.z // distance ahead of the lens
          f.mesh.visible = d > 0.2 && d < 26
          if (!f.mesh.visible) continue
          // A frame thins out as the camera passes through its plane.
          f.mat.opacity = Math.min(1, (d - 0.2) / 2.2)
          f.mesh.position.y += Math.sin(s * 0.5 + f.drift) * 0.0006
        }
        renderer.render(scene, camera)
        raf = requestAnimationFrame(tick)
      }
      setReady(true)

      cleanup = () => {
        cancelAnimationFrame(raf)
        io.disconnect()
        ro.disconnect()
        window.removeEventListener('pointermove', onMove)
        frames.forEach((f) => (f.mat.map?.dispose(), f.mat.dispose()))
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
    <section ref={section} className="dolly" aria-labelledby={id} style={{ '--n': words.length } as React.CSSProperties}>
      <div className="dolly__stage well grained">
        <canvas ref={canvas} className="dolly__canvas" data-ready={ready || undefined} aria-hidden="true" />
        <div className="dolly__veil" aria-hidden="true" />
        <div className="container statement dolly__ui">
          <h2 id={id} className="statement__line dolly__line" aria-label={line}>
            {words.map((w, i) => (
              <Fragment key={i}>
                <span className="dolly__word" aria-hidden="true" style={{ '--i': i } as React.CSSProperties}>
                  {w}
                </span>
                {i < words.length - 1 ? ' ' : ''}
              </Fragment>
            ))}
          </h2>
          <div className="statement__foot dolly__foot">{foot}</div>
        </div>
      </div>
    </section>
  )
}

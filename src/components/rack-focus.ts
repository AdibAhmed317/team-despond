// Rack focus: a focus pull between two frames, the way a camera operator
// moves focus from one subject to the next. One full-screen quad, drawn only
// while a pull runs; at rest the real <img> shows, so the canvas costs nothing.

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec4 uFitA; // xy cover scale, zw object-position
uniform vec4 uFitB;
uniform float uT;
uniform vec2 uRes;

const int TAPS = 16;
const float PI = 3.14159265;

vec2 fit(vec2 uv, vec4 f) { return 0.5 + (uv - 0.5) * f.xy + (f.zw - 0.5) * (1.0 - f.xy); }

vec3 pull(sampler2D tex, vec4 f, vec2 uv, float r) {
  vec2 aspect = vec2(uRes.y / uRes.x, 1.0);
  vec2 dir = (uv - 0.5) * r * 0.6;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < TAPS; i++) {
    float fi = float(i);
    vec2 off = vec2(cos(fi * 2.39996), sin(fi * 2.39996)) * sqrt((fi + 0.5) / float(TAPS)) * r * aspect;
    vec2 q = uv + off;
    acc += vec3(
      texture2D(tex, fit(q + dir, f)).r,
      texture2D(tex, fit(q, f)).g,
      texture2D(tex, fit(q - dir, f)).b
    );
  }
  return acc / float(TAPS);
}

void main() {
  float t = uT;
  float breathe = 1.0 - 0.035 * sin(PI * t);
  vec2 uv = 0.5 + (vUv - 0.5) * breathe;
  float maxR = 0.022;
  vec3 col;
  if (t < 0.42) {
    col = pull(uA, uFitA, uv, maxR * smoothstep(0.0, 0.5, t));
  } else if (t > 0.58) {
    col = pull(uB, uFitB, uv, maxR * (1.0 - smoothstep(0.5, 1.0, t)));
  } else {
    float m = smoothstep(0.42, 0.58, t);
    col = mix(pull(uA, uFitA, uv, maxR * smoothstep(0.0, 0.5, t)), pull(uB, uFitB, uv, maxR * (1.0 - smoothstep(0.5, 1.0, t))), m);
  }
  col *= 1.0 - 0.12 * sin(PI * t);
  gl_FragColor = vec4(col, 1.0);
}
`

type Frame = { img: HTMLImageElement; tex: WebGLTexture | null }

export type RackFocus = {
  /** Resolves once the pull has landed on frame `to`. */
  pull: (from: number, to: number, ms: number, onFirstFrame: () => void) => Promise<void>
  dispose: () => void
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function objectPosition(img: HTMLImageElement): [number, number] {
  const parts = getComputedStyle(img).objectPosition.split(' ')
  const pct = (s: string | undefined) => (s && s.endsWith('%') ? parseFloat(s) / 100 : 0.5)
  return [pct(parts[0]), 1 - pct(parts[1])]
}

/** Returns null when WebGL is missing or the frames cannot be read (CORS). */
export function createRackFocus(canvas: HTMLCanvasElement, imgs: HTMLImageElement[]): RackFocus | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = (n: string) => gl.getUniformLocation(prog, n)
  const uA = u('uA'), uB = u('uB'), uFitA = u('uFitA'), uFitB = u('uFitB'), uT = u('uT'), uRes = u('uRes')
  gl.uniform1i(uA, 0)
  gl.uniform1i(uB, 1)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  const frames: Frame[] = imgs.map((img) => ({ img, tex: null }))
  let raf = 0
  let disposed = false

  const ready = (img: HTMLImageElement) =>
    img.complete && img.naturalWidth
      ? Promise.resolve()
      : new Promise<void>((res, rej) => {
          img.addEventListener('load', () => res(), { once: true })
          img.addEventListener('error', () => rej(new Error('frame failed')), { once: true })
        })

  const texture = async (i: number) => {
    const f = frames[i]
    if (f.tex) return f.tex
    if (f.img.loading === 'lazy') f.img.loading = 'eager'
    await ready(f.img)
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, f.img) // throws when CORS-tainted
    f.tex = tex
    return tex
  }

  const fitFor = (img: HTMLImageElement): [number, number, number, number] => {
    const R = canvas.width / canvas.height
    const r = img.naturalWidth / img.naturalHeight
    const [px, py] = objectPosition(img)
    return r > R ? [R / r, 1, px, py] : [1, r / R, px, py]
  }

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr))
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
  }

  return {
    async pull(from, to, ms, onFirstFrame) {
      cancelAnimationFrame(raf)
      const [ta, tb] = await Promise.all([texture(from), texture(to)])
      if (disposed) return
      size()
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, ta)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, tb)
      gl.uniform4f(uFitA, ...fitFor(frames[from].img))
      gl.uniform4f(uFitB, ...fitFor(frames[to].img))
      await new Promise<void>((done) => {
        let start = -1
        const tick = (now: number) => {
          if (disposed) return done()
          if (start < 0) start = now
          const x = Math.min(1, (now - start) / ms)
          gl.uniform1f(uT, easeInOut(x))
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
          if (x === 0) onFirstFrame()
          if (x < 1) raf = requestAnimationFrame(tick)
          else done()
        }
        raf = requestAnimationFrame(tick)
      })
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      frames.forEach((f) => f.tex && gl.deleteTexture(f.tex))
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
      // The context stays alive: the canvas is reused if the effect runs again (StrictMode, HMR).
    },
  }
}

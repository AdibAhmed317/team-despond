import { srcSet } from '#/content/site'
import type { Photo as PhotoT } from '#/content/site'
import { cn } from '#/lib/utils'

type Props = {
  photo: PhotoT
  slot: string
  /** What the client's own picture should show; read by the hand-off list. */
  want?: string
  sizes?: string
  priority?: boolean
  cors?: boolean
  className?: string
  imgClassName?: string
  children?: React.ReactNode
  /** View-transition name: the same name on two pages makes the photo morph between them. */
  vt?: string
}

export function Photo({ photo, slot, want, sizes = '100vw', priority, cors, className, imgClassName, children, vt }: Props) {
  const vtStyle = vt ? ({ viewTransitionName: vt, viewTransitionClass: 'photo' } as React.CSSProperties) : undefined
  return (
    <figure className={cn('photo', className)} data-slot={slot} data-alt={want ?? photo.alt} style={vtStyle}>
      <img
        className={imgClassName}
        src={photo.src}
        srcSet={srcSet(photo.src)}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        style={photo.position ? { objectPosition: photo.position } : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : undefined}
        crossOrigin={cors ? 'anonymous' : undefined}
      />
      {children}
    </figure>
  )
}

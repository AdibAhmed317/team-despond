import { useState } from 'react'
import type { Photo as PhotoT, Project } from '#/content/site'
import { Photo } from '#/components/Photo'

/** Click-to-load embed: no third-party player until the visitor asks for it. */
export function VideoEmbed({ video, poster, title }: { video: NonNullable<Project['video']>; poster: PhotoT; title: string }) {
  const [playing, setPlaying] = useState(false)
  const src =
    video.provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${video.id}?autoplay=1&dnt=1`

  return (
    <div className="video">
      {playing ? (
        <iframe src={src} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" className="video__play" onClick={() => setPlaying(true)}>
          <Photo photo={poster} slot="video-poster" sizes="(min-width: 60rem) 1312px, 100vw" />
          <span className="video__label">Play the film</span>
        </button>
      )}
    </div>
  )
}

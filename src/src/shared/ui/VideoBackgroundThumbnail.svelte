<script lang="ts">
import Player from "@vimeo/player"
import type { Video } from "src/src/shared/api/api"
import { store } from "src/src/shared/model/store.svelte"

const props = $props<{
  video: Video
}>()

const { video, children } = props

let element: HTMLElement = $state(null)
let vimeo = $state(null)
let willState = $state("pause")
let videoState = $state("pause")

$effect(() => {
  if (!element) return
  if (vimeo) return

  vimeo = new Player(element, {
    id: video.video_id,
    background: true,
    autoplay: true,
    autopause: true,
    loop: true
  })

  vimeo.on("loaded", () => {
    vimeo.pause()
  })

  vimeo.on("play", () => {
    willState = "played"
    videoState = "played"
  })

  vimeo.on("ended", () => {
    willState = "pause"
    videoState = "pause"
  })
})

function handleMouseEnter() {
  willState = "played"
  vimeo.play()
}

function handleMouseLeave() {
  willState = "pause"
  vimeo.pause()
}

function handlePlayVideo() {
  store.비디오보기(video.id)
}
</script>

<video-background-thumbnail
  bind:this={element}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  will-state={willState}
  state={videoState}
  onclick={handlePlayVideo}
>
  {@render children()}
</video-background-thumbnail>

<script lang="ts">
import Player from "@vimeo/player"
import type { Video } from "src/src/shared/api/api"

const props = $props<{
  video: Video
  state: "play" | "pause"
  visible: boolean
  isPlaying: boolean

  onPlay: Function
  onEnded: Function
  onTimeupdate: Function
}>()

const { video, isPlaying, visible, onPlay, onEnded, onTimeupdate } = props

let element: HTMLElement = $state(null)
let vimeo = $state(null)

const noop = () => {}

$effect(() => {
  if (!element) return
  vimeo =
    vimeo ||
    new Player(element, {
      id: video.video_id,
      background: true,
      autoplay: false,
      autopause: true,
      loop: true
    })

  vimeo.on("play", onPlay || noop)
  vimeo.on("ended", onEnded || noop)
  vimeo.on("timeupdate", onTimeupdate || noop)
})

$effect(() => {
  if (vimeo && isPlaying && props.state === "play") {
    vimeo.play()
  }

  if (vimeo && (!isPlaying || props.state === "pause")) {
    vimeo.pause()
  }
})
</script>

<div class="layer" class:hidden={!visible}>
  <video-background bind:this={element}></video-background>
  <div class="layer bg(#000.0) pack"></div>
</div>

<script lang="ts">
import Player from "@vimeo/player"
import { store } from "src/src/shared/model/store.svelte"

let statePlay = "played"

const show = {
  controls: true,
  close: true
}

const video = {
  name: "",
  desc: ""
}

const iOS = false

let percent = $state(10)

let elementVideo
let vimeo
$effect(() => {
  if (!elementVideo) return
  if (store.currentVideoId) return

  vimeo = new Player(elementVideo, {
    id: store.currentVideoId,
    controls: iOS,
    color: "#009be0",
    title: false,
    byline: false,
    autoplay: true,
    playsinline: false,
    loop: false
  })

  const noop = () => {}
  // vimeo.on("play", onPlay || noop)
  // vimeo.on("ended", onEnded || noop)
  // vimeo.on("timeupdate", (event) => {
  //   percent = event.percent * 100
  // })
})

function TOGGLE_PLAY() {}

function handleFullscreen() {}

function handleClose() {}

function handleTimeChange(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const percentX = offsetX / rect.width

  percent = percentX * 100
}
</script>

<section popup player-popup>
  <div player-media bind:this={elementVideo}></div>

  {#if show.controls}
    <div player-title>
      <h1>{video.name}</h1>
      <h2>{video.desc}</h2>
    </div>
  {/if}

  <div layer onclick={TOGGLE_PLAY}></div>

  {#if show.controls}
    <div player-btn="play" state={statePlay} onclick={TOGGLE_PLAY}>
      <div></div>
    </div>

    <div player-btn="full-screen" onclick={handleFullscreen}>
      <div></div>
    </div>

    <div class="pointer" player-btn="close" onclick={handleClose}>
      <div></div>
    </div>

    <div player-slider onclick={handleTimeChange}>
      <div player-slider-bar>
        <div player-slider-active style="width: {percent}%"></div>
      </div>
    </div>
  {/if}
</section>

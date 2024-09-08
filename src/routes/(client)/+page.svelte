<script lang="ts">
import { TextAnimation } from "$lib/TextAnimation"
import VideoBackground from "src/src/shared/ui/VideoBackground.svelte"

const { data } = $props<{ data: PageData }>()

let doAnimation = $state(false)
let delay1 = $state(0)
let delay2 = $state(0)

const animation = new TextAnimation((animation) => {
  doAnimation = animation.doAnimation
  delay1 = animation.delay1
  delay2 = animation.delay2
})

//
let currentVideoIndex = $state(0)

const videos = data.mainVideos
const currentVideo = $derived(videos[currentVideoIndex % videos.length])

$effect(() => {
  if (currentVideoIndex) {
    animation.stop()
  }
})

const SET_MAIN_VIDEO_INDEX = (index: number) => {
  currentVideoIndex = index
}

const NEXT_MAIN_VIDEO = () => {
  currentVideoIndex++
  animation.stop()
}

//
const handleVideoPlay = () => {
  animation.start()
}

const handleVideoEnded = () => {
  NEXT_MAIN_VIDEO()
  animation.stop()
}

//
let isPlaying = $state(true)
const TOGGLE_VIDEO_PLAY = () => {
  isPlaying = !isPlaying
}

//
let progressPercent = $state(0)
const handleTimeupdate = (e) => {
  progressPercent = e.detail.percent * 100
}

const stopPropagation = (e: Event) => (fn) => {
  e.stopPropagation()
  fn()
}
</script>

<section class="video-background-list" full-screen-banner onclick={() => TOGGLE_VIDEO_PLAY(currentVideo)}>
  {#each videos as video}
    <VideoBackground
      {video}
      state={video === currentVideo ? "play" : "pause"}
      visible={video === currentVideo}
      {isPlaying}
      onPlay={handleVideoPlay}
      onEnded={handleVideoEnded}
      onTimeupdate={handleTimeupdate}
    ></VideoBackground>
  {/each}

  {#if videos.length > 0}
    <section banner-wrap>
      <section banner-desc>
        <div wrap animation-desc>
          <h1 class:animation={doAnimation} style:animation-delay="{delay1}ms">{currentVideo.name}</h1>
          <h2 class:animation={doAnimation} style:animation-delay="{delay2}ms">{currentVideo.desc}</h2>
        </div>
      </section>

      <section banner-indicators>
        <div wrap>
          {#each videos as video, i}
            <div indicator on={i === currentVideoIndex ? true : null} onclick={stopPropagation(() => SET_MAIN_VIDEO_INDEX(i))}></div>
          {/each}
        </div>
      </section>

      <section class="track">
        <div class="progress" style:width="{progressPercent}%"></div>
      </section>
    </section>
  {/if}
</section>

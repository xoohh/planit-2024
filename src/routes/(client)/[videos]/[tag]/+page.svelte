<script lang="ts">
import VideoBackgroundThumbnail from "src/src/shared/ui/VideoBackgroundThumbnail.svelte"
import VideoBackground from "src/src/shared/ui/VideoBackground.svelte"

const hasVideo = (video) => video.video_id && (video.thumbnail?.src || video.video_thumbnail)
const makeVideoThumbnail = (video) => (video.thumbnail ? video.thumbnail.src + "=s1920" : video.video_thumbnail)

const props = $props()
const tag = props.data.params.tag
const items = props.data.items

//
const videos = $derived((items || []).filter(hasVideo))

const SHOW_VIDEO_PLAYER = () => {}

const t = {}
</script>

<section title-content>
  <h1>{tag}</h1>
</section>

<section initial-content>
  {#each videos.slice(0, 1) as video}
    <VideoBackgroundThumbnail {video} inline-template>
      <div initial-content-desc>
        <div wrap animation-desc>
          <h1 class:animation={t.doAnimation} style:animation-delay="{t.delay1}ms">{video.name}</h1>
          <h2 class:animation={t.doAnimation} style:animation-delay="{t.delay2}ms">{video.desc}</h2>
        </div>
      </div>
      <div thumbnail style:background-image="url({makeVideoThumbnail(video)})"></div>
      <div loading></div>
    </VideoBackgroundThumbnail>
  {/each}
</section>

<section grid-works-content>
  {#each videos.slice(1) as video}
    <div works-cell>
      <VideoBackgroundThumbnail {video} inline-template>
        <div works-cell-desc animation-desc>
          <h1 class:animation={t.doAnimation} style:animation-delay="{t.delay1}ms">{video.name}</h1>
          <h2 class:animation={t.doAnimation} style:animation-delay="{t.delay2}ms">{video.desc}</h2>
        </div>
        <div thumbnail style:background-image="url({makeVideoThumbnail(video)})"></div>
        <div loading></div>
      </VideoBackgroundThumbnail>
    </div>
  {/each}
</section>

<section video-space>
  <p>Copyright © plan'it production. All rights reserved.</p>
</section>

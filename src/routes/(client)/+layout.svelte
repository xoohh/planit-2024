<script lang="ts">
import "src/routes/(client)/(css)/base.css"
import "src/routes/(client)/(css)/style.css"

import Works from "src/src/widgets/(nav)/Works.svelte"
import Directors from "src/src/widgets/(nav)/Directors.svelte"
import PlanV from "src/src/widgets/(nav)/PlanV.svelte"
import About from "src/src/widgets/(nav)/About.svelte"
import Contact from "src/src/widgets/(nav)/Contact.svelte"
import { store } from "src/src/shared/model/store.svelte.js"
import { page } from "$app/stores"
import VideoPlayer from "src/src/widgets/videoPlayer/VideoPlayer.svelte"

const { data } = $props<{ data: PageData }>()

store.setTags(data.tags)
store.init()
</script>

<header accent="!!store.nav">
  {#if !!store.nav || $page.url.pathname.startsWith("/blog")}
    <section bg animation="fade"></section>
  {/if}
  <div wrap>
    <section logo><a href="/"></a></section>
    <nav nav-header>
      <a _href="/works" onclick={() => store.메뉴선택("works")}>works</a>
      <a _href="/directors" onclick={() => store.메뉴선택("directors")}>directors</a>
      <a _href="/plan-v" dt-only onclick={() => store.메뉴선택("plan_v")}>plan v</a>
      <a href="/blog" dt-only>blog</a>
      <a _href="/about" dt-only onclick={() => store.메뉴선택("about")}>about</a>
      <a _href="/contact" onclick={() => store.메뉴선택("contact")}>contact</a>
    </nav>
  </div>
</header>

<!-- NAV-WORKS -->
{#if store.nav === "works"}
  <Works />
{/if}

{#if store.nav === "directors"}
  <Directors />
{/if}

{#if store.nav === "plan_v"}
  <PlanV />
{/if}

{#if store.nav === "about"}
  <About />
{/if}

<!-- CONTACT -->
{#if store.nav === "contact"}
  <Contact />
{/if}

<main is="viewController" inline-template>
  <slot />
</main>

{#if !!store.nav}
  <footer animation="fade">
    <nav nav-footer>
      <a onclick={() => store.메뉴선택("about")}>about</a>
      <a href="/blog">blog</a>
      <a onclick={() => store.메뉴선택("plan_v")}>plan v</a>
    </nav>

    <div class="copyright">
      <div>Copyright © plan’it production Inc. All rights reserved.</div>
    </div>
  </footer>
{/if}

<h1>store.currentVideoId {store.currentVideoId}</h1>

{#if !!store.currentVideoId}
  <VideoPlayer />
{/if}

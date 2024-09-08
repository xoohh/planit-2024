<script lang="ts">
import { store } from "src/src/shared/model/store.svelte.js"
</script>

<nav popup nav-popup animation="fade">
  {#each store.tags.works as tag, index}
    <a href={"/works/" + tag.toLowerCase()} id={index}>
      <div>{tag}</div>
    </a>
  {/each}
  <a href="http://archive.planit-production.com/" target="_blank">
    <div>Archive</div>
  </a>
</nav>

<script lang="ts">
import { store } from "src/src/shared/model/store.svelte.js"
</script>

<nav popup nav-popup animation="fade">
  {#each store.tags.directors as tag, index}
    <a href={"/directors/" + tag.toLowerCase()} id={index}>
      <div>{tag}</div>
    </a>
  {/each}
</nav>

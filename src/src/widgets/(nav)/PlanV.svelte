<script>
import { store } from "src/src/shared/model/store.svelte.ts"
</script>

<nav popup nav-popup animation="fade">
  {#each store.tags["plan v"] as tag, index}
    <a href={"/plan-v/" + tag.toLowerCase()} id={index}>
      <div>{tag}</div>
    </a>
  {/each}
</nav>

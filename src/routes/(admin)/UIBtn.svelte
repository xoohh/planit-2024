<script lang="ts">
export let type: string = ""
export let icon: string = ""
export let disabled: boolean
</script>

<ui-btn {type} class="hbox" on:click {disabled}>
  {#if icon}
    <svg-icon src="'icon-' + icon" />
  {/if}
  <div>
    <slot />
  </div>
</ui-btn>

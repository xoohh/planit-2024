<script lang="ts">
import UIBtn from "src/routes/(admin)/UIBtn.svelte"

export let items$ = {}
export let params = {}

const 새로고침 = () => {
  return items$.fetch()
}
</script>

<section id="table-action-bar">
  <div flex></div>
  <div>Rows per page</div>

  <space size="12"></space>

  <select number bind:value={params.limit} on:input={() => 새로고침()}>
    <option>10</option>
    <option>25</option>
    <option>50</option>
    <option>100</option>
  </select>

  <space size="22"></space>

  <div>{params.page * params.limit + 1} - {Math.min(items$.rows.total, params.page * params.limit + params.limit)} of {items$.rows.total}</div>

  <space size="16"></space>

  <UIBtn type="round" on:click={페이징이동(-1)} disabled={params.page <= 0} icon="back"></UIBtn>
  <UIBtn type="round" on:click={페이징이동(1)} disabled={params.page * params.limit + params.limit > items$.rows.total} icon="next"></UIBtn>
</section>

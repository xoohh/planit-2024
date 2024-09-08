<script lang="ts">
import AdminLayout from "src/routes/(admin)/AdminLayout.svelte"
import UIBtn from "src/routes/(admin)/UIBtn.svelte"

let categories = ["works", "directors", "plan v"]
categories.selected = categories[0]

let tags = {
  works: "",
  directors: "",
  "plan v": ""
}

// http.GET("/admin/api/configs/tags").then(function (res) {
//   console.log(res)
//
//   tags = res || {
//     works: "",
//     directors: "",
//     "plan v": ""
//   }
// })

const 선택하기 = (category: string) => {
  categories.selected = category
}

const 저장하기 = () => {
  return http.PUT("/admin/api/configs/tags", { value: tags }).then(function (res) {
    alert("저장되었습니다.")
  })
}
</script>

<AdminLayout>
  <svelte:fragment slot="titlebar">
    <h1>Tags</h1>
  </svelte:fragment>

  <svelte:fragment slot="toolbar">
    <h2 class="menu-title-sub">Tags</h2>
    <UIBtn type="simple" icon="save" on:click={저장하기}>SAVE</UIBtn>
  </svelte:fragment>

  <svelte:fragment slot="sidebar">
    <ul>
      {#each categories as category}
        <li selected={categories.selected === category} on:click={() => 선택하기(category)}>{category}</li>
      {/each}
    </ul>
  </svelte:fragment>

  <svelte:fragment slot="content">
    <section class="content-wrap" style="width: 700px; height: 100%">
      <ui-form style="height: 100%" vbox>
        <ui-fields>
          <h1>{categories.selected}</h1>
        </ui-fields>

        <div flex>
          <textarea style="height: 100%; width: 100%;" placeholder="여기를 클릭해서 입력하세요." bind:value={tags[categories.selected]}
          ></textarea>
        </div>
      </ui-form>
    </section>
  </svelte:fragment>
</AdminLayout>

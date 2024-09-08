<script lang="ts">
import AdminLayout from "src/routes/(admin)/AdminLayout.svelte"
import { jsonp } from "$lib/jsonp"
import { highlight } from "$lib/highlight"
import UIPagination from "src/routes/(admin)/UIPagination.svelte"
import { http } from "$lib/http"
import { collection } from "$lib/collection"
import { onMount } from "svelte"
import UIBtn from "src/routes/(admin)/UIBtn.svelte"

// store = window.CONFIG;

const categories = ["main", "works", "directors", "plan v"]

let item = null
let selected = null
let popup = null

let params = {
  category: [],
  tags: [],
  search: "",
  page: 0,
  limit: 25
}

let count = {}

let tag$ = Promise.resolve([])
const items$ = collection("/admin/api/items", params)
const itemsCount$ = collection("/admin/api/items/count", {})

const 새로고침 = () => {
  selected = null
  item = null

  // http.GET("/admin/api/items/count").then((function(res) {
  //   count = res;
  // }));

  items$.fetch()
}

const 페이징이동 = (offset: number) => {
  params.page = Math.max(0, params.page + offset)
  새로고침()
}

const 상태선택하기 = (status) => {
  params.status = params.status === status ? null : status
  return 새로고침()
}

const 카테고리선택하기 = (category) => {
  params.category = params.category === category ? null : category
  return 새로고침()
}

const 태그선택하기 = (tag) => {
  params.tags.toggle(tag)
  params.tags = params.tags.slice()
  return 새로고침()
}

const 선택하기 = (item) => {
  selected = selected === item ? null : item
}

const 편집하기 = (item) => {
  item = structuredClone(item)
  item.tags = item.tags || []
  item.tag_categories = item.tag_categories || []
  item.created_at2 = Date.format("yyyy-mm-dd hh:ii:ss", item.created_at)
  popup = "제품편집"
}

const 상태변경하기 = (item, status) => {
  item.status = status
  return 저장하기(item)
}

const 제품삭제하기 = (item) => {
  if (confirm("정말 삭제하시겠습니까?")) {
    return items$.remove(item).then(function () {
      selected = null
      return 새로고침()
    })
  }
}

const Vimeo업로드 = (id) => {
  /// https://vimeo.com/355462415

  id = id.split("/").pop()

  jsonp(`//vimeo.com/api/v2/video/${id}.json`)
    .then((res) => {
      res = res[0]

      console.log(res)
      console.log(res.id)

      item.video_id = "" + res.id
      item.video_thumbnail = res.thumbnail_large
      item.name = res.title
      item.desc = res.description
    })

    .catch((error) => {
      alert("유효하지 않은 URL이거나, 사용 할 수 없는 영상입니다.")
    })
}

const 저장하기 = (item) => {
  console.log("@@@", item)

  var config = store

  item.status = item.status || "비공개"

  try {
    item.created_at = new Date(item.created_at2).toISOString()
  } catch (e) {
    console.log(e)
  }

  return items$.save(item).then(function () {
    팝업닫기()
    return 새로고침()
  })
}

const 팝업닫기 = () => {
  popup = null
  selected = null
  item = null
}

onMount(() => {
  tag$ = http.GET("/admin/api/configs/tags")

  tag$.then((tags) => {
    tags = Object.entries(tags).reduce((o, [key, value]) => {
      o[key] = value.trim().split(/\n+/)
      return o
    }, {})
  })

  새로고침()
})
</script>

<AdminLayout>
  <svelte:fragment slot="titlebar">
    <h1>Videos</h1>
  </svelte:fragment>

  <svelte:fragment slot="toolbar">
    <h2 class="menu-title-sub">정보</h2>

    <UIBtn type="simple" icon="add" on:click={() => 편집하기({})}>ADD</UIBtn>
    <UIBtn type="simple" icon="remove" disabled={selected == null} on:click={() => 제품삭제하기(selected)}>DELETE</UIBtn>

    <space size="32"></space>

    <div class="hbox gap(10)">
      <UIBtn type="simple" on:click={() => 상태변경하기(selected, "공개")} disabled={selected == null}>공개</UIBtn>
      <UIBtn type="simple" on:click={() => 상태변경하기(selected, "비공개")} disabled={selected == null}>비공개</UIBtn>
    </div>

    <div flex></div>

    <ui-search on:submit={새로고침} value={params.search}></ui-search>
  </svelte:fragment>

  <svelte:fragment slot="sidebar">
    <h1>상태</h1>
    {#each ["공개", "비공개"] as row}
      <ul>
        <li menu-1 selected={params.status === row} on:click={() => 상태선택하기(row)}>
          {row}
          <span>({count[row] || "0"})</span>
        </li>
      </ul>
    {/each}

    <space size="32"></space>

    <h1>카테고리</h1>
    {#each categories as row}
      <ul>
        <li menu-1 selected={params.category === row} on:click={() => 카테고리선택하기(row)}>
          {row}
          <span>({count[row] || "0"})</span>
        </li>
      </ul>
    {/each}
  </svelte:fragment>

  <!--  <svelte:fragment slot="content">-->
  <!--    <section class="content-wrap">-->
  <!--      <table>-->
  <!--        <thead>-->
  <!--          <tr>-->
  <!--            <th style="width: 36px"></th>-->
  <!--            <th style="width: 140px"></th>-->
  <!--            <th left>Video</th>-->
  <!--            <th style="width: 100px">상태</th>-->
  <!--            <th style="width: 120px">작성일</th>-->
  <!--          </tr>-->
  <!--        </thead>-->

  <!--        <tbody>-->
  <!--          {#each items$.rows as item, index}-->
  <!--            <tr on:click={() => 선택하기(item)} selected={selected === item}>-->
  <!--              <td><i icon="checkbox"></i></td>-->

  <!--              <td>-->
  <!--                <div ratio="2:1" cover style:background-image="url({item.thumbnail.src || item.video_thumbnail})"></div>-->
  <!--              </td>-->

  <!--              <td left>-->
  <!--                <h1><span clickable on:click={() => 편집하기(item)}>{item.name || "-"}</span></h1>-->
  <!--                <h2>{item.desc || "-"}</h2>-->
  <!--                <div hbox>-->
  <!--                  <p>{@html highlight(item.tag_categories.join(", "), params.tag_categories.slice())}</p>-->
  <!--                  <span style="margin: 0 0.5em">/</span>-->
  <!--                  <p>{@html highlight(item.tags.join(", "), params.tags.slice())}</p>-->
  <!--                </div>-->
  <!--              </td>-->

  <!--              <td><span class={"status " + item.status}>{item.status}</span></td>-->

  <!--              <td>-->
  <!--                <div>{Date.format(item.created_at, "yyyy-mm-dd")}</div>-->
  <!--                <div>{Date.format(item.created_at, "hh:ii:ss")}</div>-->
  <!--              </td>-->
  <!--            </tr>-->
  <!--          {/each}-->
  <!--        </tbody>-->
  <!--      </table>-->

  <!--      <space size="12"></space>-->

  <!--      <UIPagination {items$} {params}></UIPagination>-->
  <!--    </section>-->
  <!--  </svelte:fragment>-->

  <!--<section slot="제품편집">-->
  <!--	<header>-->
  <!--		<div flex></div>-->
  <!--		<i icon="edit"></i>-->
  <!--		<h1>EDIT MODE</h1>-->
  <!--		<div flex></div>-->
  <!--		<ui-btn type="icon" class="btn-close" on:click={팝업닫기()}><i icon="close"></i></ui-btn>-->
  <!--	</header>-->

  <!--	<section popup-content-wrap>-->
  <!--		<ui-form>-->
  <!--			<ui-fields>-->
  <!--				<h1>비디오 { item.video_id }</h1>-->

  <!--				<ui-field>-->
  <!--					<h1>URL</h1>-->
  <!--					<input type="text" [(value)]="item.video_url" />-->
  <!--					<ui-btn type="inline" on:click={Vimeo업로드(item.video_url)}>LOAD</ui-btn>-->
  <!--				</ui-field>-->

  <!--				<ui-field [visible]="item.video_id">-->
  <!--					<h1>반복구간설정</h1>-->
  <!--					<input type="text" [(value)]="item.video_start_at" placeholder="시작시간(초)" />-->
  <!--					<input type="text" [(value)]="item.video_end_at" placeholder="종료시간(초)" />-->
  <!--				</ui-field>-->
  <!--			</ui-fields>-->

  <!--			<section [visible]="item.video_id">-->
  <!--				<ui-fields>-->
  <!--					<h1>기본정보</h1>-->
  <!--					<ui-field>-->
  <!--						<h1>이미지</h1>-->
  <!--						<div flex>-->
  <!--							<img [src]="item.thumbnail.src || item.video_thumbnail" width="360" />-->
  <!--						</div>-->
  <!--					</ui-field>-->

  <!--					<ui-field>-->
  <!--						<h1>업로드</h1>-->
  <!--						<ui-btn type="inline">-->
  <!--							<image-upload [(value)]="item.thumbnail">-->
  <!--								<ui-btn>UPLOAD</ui-btn>-->
  <!--							</image-upload>-->
  <!--						</ui-btn>-->
  <!--					</ui-field>-->

  <!--					<ui-field>-->
  <!--						<h1>제목</h1>-->
  <!--						<input type="text" [(value)]="item.name" />-->
  <!--					</ui-field>-->

  <!--					<ui-field>-->
  <!--						<h1>설명</h1>-->
  <!--						<input type="text" [(value)]="item.desc" />-->
  <!--					</ui-field>-->
  <!--				</ui-fields>-->

  <!--				<ui-fields>-->
  <!--					<h1>태그</h1>-->
  <!--					<ui-field>-->
  <!--						<h1>카테고리</h1>-->
  <!--						<div hbox="wrap">-->
  <!--							<label *repeat="categories as tag" style="display: block; margin: 5px">-->
  <!--								<input type="checkbox" [value]="tag" [(checked)]="item.tag_categories" /> { tag }-->
  <!--							</label>-->
  <!--						</div>-->
  <!--					</ui-field>-->

  <!--					<ui-field *repeat="categories.slice(1) as category">-->
  <!--						<h1>{ category }</h1>-->
  <!--						<div hbox="wrap">-->
  <!--							<label *repeat="tags[category] as tag" style="display: block; margin: 5px">-->
  <!--								<input type="checkbox" [value]="tag" [(checked)]="item.tags" /> { tag }-->
  <!--							</label>-->
  <!--						</div>-->
  <!--					</ui-field>-->
  <!--				</ui-fields>-->

  <!--				<ui-fields [visible]="item.created_at2">-->
  <!--					<h1>작성일(순서변경)</h1>-->

  <!--					<ui-field>-->
  <!--						<input flex type="datetime" [(value)]="item.created_at2"/>-->
  <!--					</ui-field>-->
  <!--				</ui-fields>-->
  <!--			</section>-->

  <!--		</ui-form>-->
  <!--	</section>-->

  <!--	<footer>-->
  <!--		<ui-btn type="simple" on:click={저장하기(item)} icon="save">SAVE</ui-btn>-->
  <!--	</footer>-->
  <!--</section>-->
</AdminLayout>

<style>
.video ui-image-upload-preview {
  width: 100%;
  height: 200px;
}
</style>

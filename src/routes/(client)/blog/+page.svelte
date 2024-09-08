<script lang="ts">
const { data } = $props<{ data: PageData }>()

const blogs = data.blogs || []

const html = (body: string) => {
  const img_reg = /<img [^>]*>/g
  body = body.replace(img_reg, (a) => "</p>" + a + "<p>").replace(/<p><\/p>/g, "")
  body = "<p>" + body + "</p>"
  return body
}
</script>

<space size-header></space>

<section grid-blog-content>
  {#each blogs as blog}
    <div post grid-masonry>
      <h1 title-bar="stress">
        <div title>{blog.name}</div>
      </h1>
      {#if blog.cover?.src}
        <div post-img><img src="{blog.cover.src}=s1024" style="object-fit: contain" /></div>
      {/if}
      <div post-desc blog class=">>img:h(auto)">{@html html(blog.body)}</div>
    </div>
  {/each}
</section>

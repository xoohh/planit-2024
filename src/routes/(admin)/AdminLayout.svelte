<script lang="ts">
import UIBtn from "src/routes/(admin)/UIBtn.svelte"

const config = {
  title: "AdminLayout"
}

const account = {
  email: "admin@example.com"
}

let isNavShow = true
let popup = false

const 네비토글 = () => {}

const 로그아웃 = () => {}
</script>

<main class="vbox h(100%)">
  <nav id="menubar" class={isNavShow ? "show" : "hide"}>
    <a href="/admin/videos">
      <div>videos</div>
    </a>

    <a href="/admin/tags">
      <div>tags</div>
    </a>

    <a href="/admin/pages/blog">
      <div>blog</div>
    </a>

    <a href="/admin/users">
      <div>admin</div>
    </a>
  </nav>

  <section id="title" class="hbox">
    <UIBtn type="icon" on:click={네비토글}><i icon="menu"></i></UIBtn>

    <h1><a href="/" target="_blank">{config.title}</a></h1>

    <h2>1px administration system</h2>

    <div class="w(fill)" />

    <div class="account">{account.email}</div>

    <UIBtn type="inline" on:click={로그아웃}>LOGOUT</UIBtn>
  </section>

  <section class="h(fill) vbox">
    <section id="toolbar" class="hbox">
      <div sidebar class="menu-title">
        <slot name="titlebar" />
      </div>
      <div class="menu-actions">
        <slot name="toolbar" />
      </div>
    </section>

    <section class="h(fill) hbox(start)" style="position: relative;">
      <div sidebar class="relative" style="height:100%;">
        <div layer class="nav">
          <slot name="sidebar" />
        </div>
      </div>

      <div class="w(fill) h(100%) scroll-y">
        <slot name="content" />
      </div>

      <div class="copyright">
        <img src="/admin/img/copyright-1px.svg" width="70" height="10" />
      </div>
    </section>

    {#if popup}
      <ui-popup>
        <slot name="popup" />
      </ui-popup>
    {/if}
  </section>
</main>

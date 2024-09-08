/// -----------------------------------------------------------------------
/// Common
/// -----------------------------------------------------------------------
// import { on } from "src/routes/(client)/actions"
// import { combineLatest, exhaustMap, map, of, shareReplay, tap, withLatestFrom } from "rxjs"
// import { http } from "src/routes/(client)/api"
//
// const useAsyncData = (key: string, fn) => {}
//
// const pathname = typeof window === "undefined" ? "" : window.location.pathname
//
// const urlpath = pathname
//   .split("/")
//   .slice(1)
//   .map((s) => decodeURIComponent(s))
//
// const initNav = urlpath[0] === "blog" ? "blog" : ""
//
// const nav = combineLatest([
//   of(initNav), //
//   on.메뉴선택.pipe(map((menu) => (prev) => (prev === menu ? initNav : menu)))
// ])
//
// const tags = on.FETCH_TAGS.SUCCESS.pipe(shareReplay(1))
//
// const useTags = () => useAsyncData("tags", http.GET["/api/configs/tags"])
//
// /// -----------------------------------------------------------------------
// /// Main
// /// -----------------------------------------------------------------------
// const main_videos = on.FETCH_MAIN_VIDEOS.SUCCESS.pipe(shareReplay(1))
//
// const main_videos_index = combineLatest([
//   of(0),
//   combineLatest([main_videos, on.SET_MAIN_VIDEO_INDEX]).pipe(map(([mainVideos, index]) => index % mainVideos.length))
// ])
//
// const current_main_video = combineLatest([main_videos, main_videos_index]).pipe(
//   map(([videos, index]) => videos[index]),
//   shareReplay(1)
// )
//
// /// -----------------------------------------------------------------------
// /// VIDEOS
// /// -----------------------------------------------------------------------
// const videos = on.FETCH_VIDEOS.SUCCESS.pipe(shareReplay(1))
//
// /// -----------------------------------------------------------------------
// /// BLOGS
// /// -----------------------------------------------------------------------
// const blogs = on.FETCH_BLOGS.SUCCESS.pipe(shareReplay(1))
//
// /// -----------------------------------------------------------------------
// /// Effects:
// /// -----------------------------------------------------------------------
// on.FETCH_TAGS.pipe(
//   exhaustMap(http.GET["/api/configs/tags"]),
//   map((res) => {
//     const tags = {}
//     Object.keys(res).forEach((key) => {
//       tags[key] = res[key].split(/\s*\n\s*/)
//     })
//     return tags
//   }),
//   tap({ next: on.FETCH_TAGS.SUCCESS, error: on.FETCH_TAGS.FAILURE })
// ).subscribe()
//
// on.FETCH_MAIN_VIDEOS.pipe(
//   exhaustMap(http.GET["/api/items/main"]),
//   tap({ next: on.FETCH_MAIN_VIDEOS.SUCCESS, error: on.FETCH_MAIN_VIDEOS.FAILURE })
// ).subscribe()
//
// on.FETCH_BLOGS.pipe(
//   exhaustMap(http.GET["/api/blogs"]), //
//   tap({ next: on.FETCH_BLOGS.SUCCESS, error: on.FETCH_BLOGS.FAILURE })
// ).subscribe()
//
// on.FETCH_VIDEOS.pipe(
//   withLatestFrom(tags),
//   map(([{ category, tag }, tags]) => {
//     tags = tags[category]
//     const _tags = tags.map((tag) => tag.toLowerCase())
//     tag = tags[_tags.indexOf(tag)]
//     return { category, tag }
//   }),
//   exhaustMap(({ category, tag }) => http.GET["/api/items/:category/:tag"](category, tag)),
//   tap({ next: on.FETCH_VIDEOS.SUCCESS, error: on.FETCH_VIDEOS.FAILURE })
// ).subscribe()
//
// // on.SHOW_VIDEO_PLAYER.pipe(
// //   tap(videoPlayer.show) //
// // ).subscribe()
//
// on.NEXT_MAIN_VIDEO.pipe(
//   withLatestFrom(main_videos_index),
//   map(([__, index]) => index + 1),
//   tap(on.SET_MAIN_VIDEO_INDEX)
// ).subscribe()
//
// export const store = {
//   urlpath,
//   tags,
//   nav,
//   main_videos,
//   main_videos_index,
//   current_main_video,
//   videos,
//   blogs
// }

import { afterNavigate, onNavigate } from "$app/navigation"
import { page } from "$app/stores"

class Store {
  nav = $state("")
  tags = $state({
    works: [],
    "plan v": [],
    directors: []
  })

  currentVideoId = $state("")

  init() {
    afterNavigate(() => {
      this.메뉴선택("")
    })
  }

  setTags(tags) {
    this.tags = Object.fromEntries(Object.entries(tags).map(([key, value]) => [key, value.split(/\s*\n\s*/)]))
  }

  메뉴선택(nav) {
    this.nav = this.nav === nav ? "" : nav
  }

  비디오보기(videoId: string) {
    this.currentVideoId = videoId
  }
}

export const store = new Store()

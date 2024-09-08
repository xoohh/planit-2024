import type { PageLoad } from "./$types"
import { http } from "src/src/shared/api/api"

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = false

export const load: PageLoad = async ({ fetch, params }) => {
  http.config.fetch = fetch

  const { data: mainVideos } = await http.GET["/api/items/main"]()
  const { data: tags } = await http.GET["/api/configs/tags"]()

  return {
    mainVideos,
    tags
  }
}
import { createAPI, type createResponse } from "$lib/api/apiForge"
import { fetchAdapter } from "$lib/api/adapter/fetchAdapter"

type Response<T> = createResponse<T>

export interface Video {
  status: string
  search: string[]
  name: string
  video_url: string
  tags: string[]
  created_at: string
  video_id: string
  updated_at: string
  thumbnail?: Thumbnail
  class_: string[]
  video_end_at?: string
  id: number
  tag_categories: string[]
  desc: string
  type: any
  video_start_at?: string
  video_thumbnail: string
  search_tags?: string[]
}

export interface Thumbnail {
  src: string
  name: string
  height: number
  width: number
  path: any
  id: any
}

export interface API_Post {
  GET: {
    ["/api/items/main"](): Response<Video[]>
    ["/api/items/:category/:tag"](category: string, tag: string): Response<Video[]>
    ["/api/blogs"](): Response<Video>
    ["/api/configs/tags"](): Response<Record<string, string>>
  }
}

type API = API_Post

export const http = createAPI<API>({
  adapter: fetchAdapter(),
  fetch: fetch
})

import { redirect } from "@sveltejs/kit"

export function load() {
  return redirect(302, "/admin/videos")
}

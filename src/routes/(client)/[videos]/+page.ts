import { redirect } from "@sveltejs/kit"

// export function match(params) {
//   switch (params.videos) {
//     case "works":
//     case "directors":
//     case "plan v":
//       return true
//   }
//   return false
// }

export function load() {
  return redirect(301, "/")
}

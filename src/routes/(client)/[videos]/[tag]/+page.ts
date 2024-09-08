import { http } from "src/src/shared/api/api"

export async function load({ params }) {
  const { data: items } = await http.GET["/api/items/works/latest"]()

  return {
    params,
    items
  }
}

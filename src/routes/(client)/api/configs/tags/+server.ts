import { json } from "@sveltejs/kit"

export function GET() {
  return json({
    "plan v": "Coming Soon",
    directors: "John S. Park\nKyu Ha Kim\nHun Lee\nKaye Hwang\nPaul Kim\nDune\nSung An You\nDong Hwa Shin\n",
    works: "Latest\nFeatured\nAwards\nGlobal\nService Production"
  })
}

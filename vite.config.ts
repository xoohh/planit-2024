import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import { adorableCSS } from "adorable-css/vite"

export default defineConfig({
  plugins: [sveltekit(), adorableCSS()]
})

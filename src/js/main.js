import { initUI } from "./ui.mjs"
import { initDarkModeToggle } from "./darkmode.js"
import { renderHome } from "./home.mjs"
import { initSearchModal } from "./search.mjs"

document.addEventListener("DOMContentLoaded", async () => {
  await initUI()
  initDarkModeToggle()
  renderHome()
  initSearchModal()
})

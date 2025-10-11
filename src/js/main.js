import { initUI } from "./ui.mjs"
import { initDarkModeToggle } from "./darkmode.js"
import { renderHome } from "./home.mjs"

document.addEventListener("DOMContentLoaded", async () => {
  await initUI()
  initDarkModeToggle()
  renderHome()
})

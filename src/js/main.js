import { initUI } from "./ui.mjs"
import { initDarkModeToggle } from "./darkmode.js"

document.addEventListener("DOMContentLoaded", () => {
  initUI()
  initDarkModeToggle()
})

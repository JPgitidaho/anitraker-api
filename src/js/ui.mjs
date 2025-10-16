import { initMenuToggle, initDropdownMenu } from "./menu.js"
import { renderHome } from "./home.mjs"
import { renderDetails } from "./details.mjs"
import { renderFavorites } from "./favorites.mjs"
import { renderWatchlist } from "./watchlist.mjs"
import { renderCategory } from "./categories.mjs"


export async function initUI() {
  await loadPartial("header", "/partials/header.html")
  await loadPartial("footer", "/partials/footer.html")
  initMenuToggle()
  initDropdownMenu()
  setupNavigation()
}

async function loadPartial(id, path) {
  const res = await fetch(path)
  const html = await res.text()
  const container = document.createElement("div")
  container.innerHTML = html
  if (id === "header") {
    document.body.insertBefore(container, document.body.firstChild)
  } else if (id === "footer") {
    document.body.appendChild(container)
  }
  return container
}

function setupNavigation() {
  document.addEventListener("click", e => {
    const link = e.target.closest("[data-page]")
    if (!link) return
    e.preventDefault()

    const page = link.dataset.page
    const id = link.dataset.id || null
    renderPage(page, id)
  })
}


export function renderPage(page, id = null) {
  switch (page) {
    case "home":
      renderHome()
      break
    case "details":
      if (id) renderDetails(id)
      break
    case "favorites":
      renderFavorites()
      break
    case "watchlist":
      renderWatchlist()
      break
    default:
      renderHome()
      break
      case "category":
  if (id) renderCategory(id)
  break

  }
}

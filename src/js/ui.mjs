import { renderHome } from "./home.mjs"
import { renderWatchlist } from "./watchlist.mjs"
import { renderDetails } from "./details.mjs"
import { renderFavorites } from "./favorites.mjs"

export async function initUI() {
  await loadPartial("header", "/partials/header.html")
  await loadPartial("footer", "/partials/footer.html")
  renderPage("home")

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault()
      const page = e.target.textContent.toLowerCase()
      renderPage(page)
    })
  })
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
}

const pages = {
  home: renderHome,
  watchlist: renderWatchlist,
  favorites: renderFavorites
}

export async function renderPage(page, id = null) {
  if (page === "details" && id) return renderDetails(id)
  return pages[page]?.()
}

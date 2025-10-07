import { getItem, setItem } from "./storage.mjs"
import { renderPage } from "./ui.mjs"
import { initCarousel, disableCarousel } from "./carousel.mjs"

export function renderWatchlist() {
  const app = document.getElementById("app")
  app.innerHTML = `
    <section class="watchlist-page">
      <h2 class ="watch-subt" >Your Watchlist</h2>
      <section class="carousel-container">
        <button class="carousel-btn left">❮</button>
        <div class="cards carousel-track" id="watchlist-track"></div>
        <button class="carousel-btn right">❯</button>
      </section>
    </section>
  `

  const track = document.getElementById("watchlist-track")
  const list = getItem("watchlist")

  if (!list || !list.length) {
    track.innerHTML = `<p class="error">Your watchlist is empty.</p>`
    disableCarousel()
    return
  }

  track.innerHTML = list.map(anime => `
    <article class="card">
      <div class="card-image">
        <img src="${anime.img}" alt="${anime.title}">
      </div>
      <h3>${anime.title}</h3>
      <div class="actions">
        <button class="details-btn" data-id="${anime.id}">View Details</button>
        <button class="remove-btn" data-id="${anime.id}">Remove</button>
      </div>
    </article>
  `).join("")

  initCarousel("#watchlist-track")

  track.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault()
      renderPage("details", btn.dataset.id)
    })
  })

  track.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const updated = list.filter(i => i.id !== btn.dataset.id)
      setItem("watchlist", updated)
      renderWatchlist()
    })
  })
}

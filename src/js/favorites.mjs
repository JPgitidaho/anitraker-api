import { getItem, setItem } from "./storage.mjs"
import { renderPage } from "./ui.mjs"
import { initCarousel, disableCarousel } from "./carousel.mjs"

export function renderFavorites() {
  const app = document.getElementById("app")
  app.innerHTML = `
    <section>
      <h2 class="watch-subt">Your Favorites</h2>
      <section class="carousel-container">
        <button class="carousel-btn left">❮</button>
        <div class="cards carousel-track" id="favorites-track"></div>
        <button class="carousel-btn right">❯</button>
      </section>
    </section>
  `

  const track = document.getElementById("favorites-track")
  let list = getItem("favorites")


  list = list.filter(i => i && i.img && i.title)

  
  setItem("favorites", list)

  if (!list.length) {
    track.innerHTML = `<p class="error">Your favorites list is empty.</p>`
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
      <button class="remove-btn" data-tooltip="Remove" data-id="${anime.id}">🗑️</button>
      </div>
    </article>
  `).join("")

  initCarousel("#favorites-track")

  track.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault()
      renderPage("details", btn.dataset.id)
    })
  })

  track.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const updated = list.filter(i => i.id !== btn.dataset.id)
      setItem("favorites", updated)
      renderFavorites()
    })
  })
}

export function addToFavorites(anime) {
  const list = getItem("favorites")
  if (!list.find(i => i.id === anime.id)) {
    list.push(anime)
    setItem("favorites", list)
  }
}

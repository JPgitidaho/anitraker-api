import { getItem, setItem, isInList, toggleFavoriteItem } from "./storage.mjs"
import { renderPage } from "./ui.mjs"
import { initCarousel, disableCarousel } from "./carousel.mjs"

export function renderWatchlist() {
  const app = document.getElementById("app")
  app.innerHTML = `
    <section>
      <h2 class="watch-subt">Your Watchlist</h2>
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

track.innerHTML = list.map(anime => {
  const fav = isInList("favorites", anime.id)
  return `
    <article class="card">
      <div class="card-image">
        <img src="${anime.img}" alt="${anime.title}">
      </div>
      <h3>${anime.title}</h3>
      <div class="actions">
        <button class="details-btn" data-id="${anime.id}">View Details</button>
        <div class="watchlist-btns">
          <button class="fav-btn" data-tooltip="Add to Favorites" data-id="${anime.id}" data-title="${anime.title}" data-img="${anime.img}">
            ${fav ? "♥" : "♡"}
          </button>
          <button class="remove-btn" data-tooltip="Remove" data-id="${anime.id}">🗑️</button>
        </div>
      </div>
    </article>
  `
}).join("")


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

  track.querySelectorAll(".fav-btn").forEach(btn => {
    const updateStyle = (isFav) => {
      btn.textContent = isFav ? "♥" : "♡"
      btn.style.color = isFav ? "red" : ""
      btn.style.borderColor = isFav ? "red" : ""
    }

    const currentFav = isInList("favorites", btn.dataset.id)
    updateStyle(currentFav)

    btn.addEventListener("click", () => {
      const nextIsFav = toggleFavoriteItem({
        id: btn.dataset.id,
        title: btn.dataset.title,
        img: btn.dataset.img
      })
      updateStyle(nextIsFav)
    })
  })
}

import { fetchAniList } from "./anilist.mjs"
import { renderPage } from "./ui.mjs"
import { isInList, createFavoriteToggle, createWatchlistToggle } from "./storage.mjs"

export async function renderCategory(genre) {
  const app = document.getElementById("app")
  app.innerHTML = `<p class="loading">Loading ${genre} anime...</p>`

  const query = `
    query ($genre: String) {
      Page(page: 1, perPage: 20) {
        media(genre_in: [$genre], type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title { english romaji }
          coverImage { large }
          averageScore
        }
      }
    }
  `

  const data = await fetchAniList(query, { genre })
  const animes = data?.Page?.media ?? []

  if (!animes.length) {
    app.innerHTML = `<p class="error">No results found for ${genre}.</p>`
    return
  }

  app.innerHTML = `
  <section>
    <h2 class="subt">${genre.toUpperCase()} ANIME</h2>
    <div class="category-grid" id="category-grid"></div>
  </section>
`

const grid = document.getElementById("category-grid")

grid.innerHTML = animes
  .map(
    a => `
    <article class="category-card">
      <img src="${a.coverImage.large}" alt="${a.title.english || a.title.romaji}">
      <div class="overlay-actions">
        <button class="icon-btn watchlist-toggle" data-id="${a.id}" data-title="${a.title.english || a.title.romaji}" data-img="${a.coverImage.large}" data-tooltip="${isInList("watchlist", a.id) ? "In watchlist" : "Add to watchlist"}"></button>
        <button class="icon-btn fav-btn" data-id="${a.id}" data-title="${a.title.english || a.title.romaji}" data-img="${a.coverImage.large}" data-tooltip="${isInList("favorites", a.id) ? "In favorites" : "Add to favorites"}"></button>
        <button class="icon-btn details-btn" data-id="${a.id}" data-tooltip="View details">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
      <h3>${a.title.english || a.title.romaji}</h3>
    </article>
  `
  )
  .join("")


  document.querySelectorAll(".watchlist-toggle").forEach(btn => createWatchlistToggle(btn))
  document.querySelectorAll(".fav-btn").forEach(btn => createFavoriteToggle(btn))
  document.querySelectorAll(".details-btn").forEach(btn =>
    btn.addEventListener("click", () => renderPage("details", btn.dataset.id))
  )
}

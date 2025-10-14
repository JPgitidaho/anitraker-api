import { getItem, setItem, isInList, createWatchlistToggle } from "./storage.mjs"
import { renderPage } from "./ui.mjs"

export function renderFavorites() {
  const app = document.getElementById("app")
  app.innerHTML = `
    <section>
      <h2 class="subt">Your Favorites</h2>
      <div id="favorites-list" class="favorites-grid"></div>
    </section>
  `

  const listContainer = document.getElementById("favorites-list")
  let list = getItem("favorites").filter(i => i && i.img && i.title)
  setItem("favorites", list)

  if (!list.length) {
    listContainer.innerHTML = `<p class="error">Your favorites list is empty.</p>`
    return
  }

  listContainer.innerHTML = list
    .map(anime => `
      <article class="fav-card">
        <div class="fav-thumb">
          <img src="${anime.img}" alt="${anime.title}">
          <span class="badge">PREMIUM</span>
        </div>
        <div class="fav-info">
          <h3>${anime.title}</h3>
        </div>
            <div class="actions">
              <button 
                class="icon-btn watchlist-toggle" 
                aria-label="Add to Watchlist"
                data-id="${anime.id}" 
                data-title="${anime.title}" 
                data-img="${anime.img}"
                data-tooltip="${isInList('watchlist', anime.id) ? 'In watchlist' : 'Add to watchlist'}">
                ${isInList('watchlist', anime.id)
                  ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/></svg>`
                  : `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/><path d="M12 8v6M9 11h6"/></svg>`}
              </button>
              <a class="details-btn" data-id="${anime.id}" data-tooltip="View details">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                </a>
              <button class="icon-btn remove-btn" data-id="${anime.id}" data-tooltip="Remove">🗑️</button>
            </div>
          </div>
        </div>
      </article>
    `)
    .join("")

  listContainer.querySelectorAll(".details-btn").forEach(btn => {
    btn.addEventListener("click", () => renderPage("details", btn.dataset.id))
  })

  listContainer.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      list = list.filter(i => i.id !== btn.dataset.id)
      setItem("favorites", list)
      renderFavorites()
    })
  })

  listContainer.querySelectorAll(".watchlist-toggle").forEach(btn => createWatchlistToggle(btn))
}

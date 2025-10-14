import { getItem, setItem, createWatchlistToggle, createFavoriteToggle, isInList } from "./storage.mjs"
import { renderPage } from "./ui.mjs"

export function renderWatchlist() {
  const app = document.getElementById("app")
  app.innerHTML = `
    <section>
      <h2 class="subt">Your Watchlist</h2>
      <div id="watchlist-list" class="favorites-grid"></div>
    </section>
  `

  const listContainer = document.getElementById("watchlist-list")
  let list = getItem("watchlist").filter(i => i && i.img && i.title)
  setItem("watchlist", list)

  if (!list.length) {
    listContainer.innerHTML = `<p class="error">Your watchlist is empty.</p>`
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
          <div class="fav-bottom">
            <p class="badge">Sub | Dob</p>
            <div class="actions">
              <button 
                class="icon-btn watchlist-toggle"
                aria-label="Add to Watchlist"
                data-id="${anime.id}"
                data-title="${anime.title}"
                data-img="${anime.img}"
                data-tooltip="In watchlist">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/>
                </svg>
              </button>

              <button 
                class="icon-btn fav-btn"
                aria-label="Add to Favorites"
                data-id="${anime.id}"
                data-title="${anime.title}"
                data-img="${anime.img}"
                data-tooltip="${isInList('favorites', anime.id) ? 'In favorites' : 'Add to favorites'}">
                ${isInList('favorites', anime.id)
                  ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="22" height="22">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                      2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                      C13.09 3.81 14.76 3 16.5 3 
                      19.58 3 22 5.42 22 8.5
                      c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>`
                  : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                      <path d="M12.1 8.64l-.1.1-.11-.1
                      C10.14 6.7 7.1 6.7 5.1 8.7
                      c-2 2-2 5.2 0 7.2l6.9 6.9
                      6.9-6.9c2-2 2-5.2 0-7.2
                      -2-2-5.04-2-7 0z"/>
                    </svg>`}
              </button>

              <a class="details-btn" data-id="${anime.id}" data-tooltip="View details">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </a>
              <button class="remove-btn" data-id="${anime.id}" data-tooltip="Remove">🗑️</button>
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
      setItem("watchlist", list)
      renderWatchlist()
    })
  })

  listContainer.querySelectorAll(".watchlist-toggle").forEach(btn => createWatchlistToggle(btn))
  listContainer.querySelectorAll(".fav-btn").forEach(btn => createFavoriteToggle(btn))
}

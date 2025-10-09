import { getData } from "./api.mjs"
import { fetchAniList } from "./anilist.mjs"
import { addToList, isInList, toggleFavoriteItem, truncateText } from "./storage.mjs"
import { initCarousel } from "./carousel.mjs"
import { openCharacterModal } from "./characters-modal.mjs"
import { renderPage } from "./ui.mjs"

export async function renderDetails(id) {
  const app = document.getElementById("app")
  app.innerHTML = `<p>Loading details...</p>`

  const [details, characters, recommendations] = await Promise.all([
    getData(`/anime/${id}`),
    getData(`/anime/${id}/characters`),
    getData(`/anime/${id}/recommendations`)
  ])

  let anime = details?.data
  let fromAniList = false

  if (!anime) {
    const aniData = await fetchAniList(`
      query ($id: Int) {
        Media(idMal: $id, type: ANIME) {
          id
          title { romaji english }
          description(asHtml: false)
          coverImage { large }
          averageScore episodes genres seasonYear format source status
        }
      }
    `, { id: Number(id) })
    anime = aniData?.Media
    fromAniList = true
  }

  if (!anime) {
    app.innerHTML = `<p class="error">Unable to load details.</p>`
    return
  }

  const chars = characters?.data ?? []
  const recs = recommendations?.data ?? []
  const title = anime.title?.english || anime.title?.romaji || anime.title
  const img = anime.coverImage?.large || anime.images?.jpg?.image_url

 
  function renderCarouselSection(title, list, type, templateFn) {
    return `
      <section class="${type}">
        <h3>${title}</h3>
        <section class="carousel-container">
          <button class="carousel-btn left">❮</button>
          <div class="cards carousel-track ${type}-list">
            ${list.length ? list.map(templateFn).join("") : "<p class='error'>No data available.</p>"}
          </div>
          <button class="carousel-btn right">❯</button>
        </section>
      </section>
    `
  }

  app.innerHTML = `
    <section class="body-details">
      <div class="details-hero">
        <div class="details-content">
          <img class="details-poster" src="${img}" alt="${title}">
          <div class="hero-actions">
            <button class="watch-btn" data-id="${id}" data-title="${title}" data-img="${img}">Add to Watchlist</button>
            ${
              !fromAniList && anime.trailer?.url
                ? `<a href="${anime.trailer.url}" target="_blank"><button class="trailer-btn">Watch Trailer</button></a>`
                : ""
            }
          </div>
        </div>
        <div class="hero-info">
          <h2 class="hero-title">${title}</h2>
          <p>${truncateText(anime.synopsis ?? anime.description ?? "No synopsis available.", 300)}</p>
          <div class="genres">
            ${
              (anime.genres ?? [])
                .map(g => (typeof g === "string" ? `<span class="chip">${g}</span>` : `<span class="chip">${g.name}</span>`))
                .join("") || "<span class='chip'>Unknown</span>"
            }
          </div>
          ${
            anime.source === "Manga" || anime.source === "MANGA"
              ? `<p class="hero-manga">📖 Based on a Manga</p>`
              : ""
          }
          <p>⭐ ${anime.score ?? anime.averageScore ?? "N/A"}</p>
          <div class="micro-info">
            <p>🎬 Type: ${anime.type ?? "Unknown"}</p>
            <p>📅 Aired: ${anime.season ? `${anime.season} ${anime.year}` : anime.year ?? "Unknown"}</p>
            <p>📺 Episodes: ${anime.episodes ?? "?"}</p>
            <p>📡 Status: ${anime.status ?? "Unknown"}</p>
          </div>
          <button class="fav-btn" data-id="${id}" data-title="${title}" data-img="${img}">♡</button>
        </div>
      </div>

      ${renderCarouselSection("Characters", chars, "character", c => `
        <div class="card character-card" data-id="${c.character.mal_id}">
          <div class="card-image">
            <img src="${c.character.images.jpg.image_url}" alt="${c.character.name}">
          </div>
          <h4>${c.character.name}</h4>
          <p class="role">${c.role}</p>
          <button class="view-more-btn">View More</button>
        </div>
      `)}

      ${renderCarouselSection("Recommended", recs, "recommended", r => `
        <article class="card recommended-card" data-id="${r.entry.mal_id}">
          <div class="card-image">
            <img src="${r.entry.images.jpg.image_url}" alt="${r.entry.title}">
          </div>
          <h3>${r.entry.title}</h3>
          <p>⭐ ${r.entry.score ?? "N/A"}</p>
        </article>
      `)}
    </section>
  `

  setupButtons()
  initCarousel(".character-list")
  initCarousel(".recommended-list")

  document.querySelectorAll(".character-card").forEach(card => {
    card.addEventListener("click", e => {
      if (!e.target.classList.contains("view-more-btn")) return
      openCharacterModal(card.dataset.id)
    })
  })

  const recList = document.querySelector(".recommended-list")
  if (recList) {
    recList.addEventListener("click", e => {
      const card = e.target.closest(".recommended-card")
      if (card) renderPage("details", card.dataset.id)
    })
  }
}

function setupButtons() {
  const watchBtn = document.querySelector(".watch-btn")
  if (watchBtn) {
    watchBtn.addEventListener("click", () => {
      addToList("watchlist", {
        id: watchBtn.dataset.id,
        title: watchBtn.dataset.title,
        img: watchBtn.dataset.img
      })
    })
  }

  const favBtn = document.querySelector(".fav-btn")
  if (favBtn) {
    const isFav = isInList("favorites", favBtn.dataset.id)
    favBtn.textContent = isFav ? "♥" : "♡"
    favBtn.style.color = isFav ? "red" : ""
    favBtn.style.borderColor = isFav ? "red" : ""

    favBtn.addEventListener("click", () => {
      const nextIsFav = toggleFavoriteItem({
        id: favBtn.dataset.id,
        title: favBtn.dataset.title,
        img: favBtn.dataset.img
      })
      favBtn.textContent = nextIsFav ? "♥" : "♡"
      favBtn.style.color = nextIsFav ? "red" : ""
      favBtn.style.borderColor = nextIsFav ? "red" : ""
    })
  }
}

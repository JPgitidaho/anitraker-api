import { getData } from "./api.mjs"
import { getItem, setItem } from "./storage.mjs"
import { renderPage } from "./ui.mjs"
import { initCarousel, disableCarousel } from "./carousel.mjs"

export async function renderHome() {
  const app = document.getElementById("app")
  app.innerHTML = `<div class="loader"></div>`

  const data = await getData("/top/anime")
  const topAnimes = (data?.data ?? []).filter(a => a.source === "Manga")

  if (!topAnimes.length) {
    app.innerHTML = `<p class="error">No anime based on Manga found.</p>`
    return
  }

  let current = 0

  const renderShell = (anime) => {
    app.innerHTML = `
      <section class="hero" style="--hero-img: url('${anime.images.webp?.large_image_url}')">
        <div class="hero-image"></div>
        <div class="hero-content">
          <h2 class="hero-title">${anime.title_english ?? anime.title}</h2>
          <h3 class="hero-subtitle">${anime.title_japanese ?? ""}</h3>
          <p class="hero-synopsis">${truncateText(anime.synopsis ?? "No synopsis available.", 220)}</p>
          <div class="hero-actions">
            <button class="details-btn" data-id="${anime.mal_id}">View Details</button>
          </div>
        </div>
      </section>

      <div class="search-box">
        <input type="text" id="search" placeholder="Search anime or manga...">
        <button id="search-btn" aria-label="Search" class="search-icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               viewBox="0 0 24 24" width="22" height="22">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      <section class="categories">
        <button data-cat="trending">Trending</button>
        <button data-cat="seasonal">Seasonal</button>
        <button data-cat="genres">Genres</button>
      </section>

      <section class="carousel-container">
        <button class="carousel-btn left">❮</button>
        <div id="anime-list" class="cards carousel-track"></div>
        <button class="carousel-btn right">❯</button>
      </section>
    `

    document.querySelector(".details-btn")
      .addEventListener("click", () => renderPage("details", anime.mal_id))

    const searchInput = document.getElementById("search")
    const searchBtn = document.getElementById("search-btn")
    const doSearch = () => {
      const term = searchInput.value.trim()
      if (term) loadAnime(`/anime?q=${encodeURIComponent(term)}&limit=20`)
    }
    searchInput.addEventListener("keypress", e => e.key === "Enter" && doSearch())
    searchBtn.addEventListener("click", doSearch)

    const categories = document.querySelector(".categories")
    categories.querySelector('[data-cat="genres"]').addEventListener("click", () => loadGenres())
    categories.querySelector('[data-cat="trending"]').addEventListener("click", () => loadAnime("/top/anime?limit=20"))
    categories.querySelector('[data-cat="seasonal"]').addEventListener("click", () => loadAnime("/seasons/now?limit=20"))
  }

  const updateHeroOnly = (anime) => {
    const hero = document.querySelector(".hero")
    if (!hero) return

    hero.style.setProperty("--hero-img", `url('${anime.images.webp?.large_image_url}')`)

    const title = hero.querySelector(".hero-title")
    const subtitle = hero.querySelector(".hero-subtitle")
    const synopsis = hero.querySelector(".hero-synopsis")
    const detailsBtn = hero.querySelector(".details-btn")

    if (title) title.textContent = anime.title_english ?? anime.title
    if (subtitle) subtitle.textContent = anime.title_japanese ?? ""
    if (synopsis) synopsis.textContent = truncateText(anime.synopsis ?? "No synopsis available.", 220)
    if (detailsBtn) {
      detailsBtn.dataset.id = anime.mal_id
      detailsBtn.onclick = () => renderPage("details", anime.mal_id)
    }
  }

  renderShell(topAnimes[current])

  setInterval(() => {
    current = (current + 1) % topAnimes.length
    updateHeroOnly(topAnimes[current])
  }, 7000)

  loadAnime("/top/anime?")
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
}

async function loadAnime(endpoint) {
  const track = document.querySelector(".carousel-track")
  if (!track) return

  track.innerHTML = `<div class="loader"></div>`

  try {
    const data = await getData(endpoint)
    const items = data?.data ?? []
    if (!items.length) {
      track.innerHTML = `<p class="error">No results found.</p>`
      disableCarousel()
      return
    }

    track.innerHTML = items.map(anime => `
      <article class="card">
        <div class="card-image">
          <img src="${anime.images.webp?.image_url || anime.images.jpg.image_url}" alt="${anime.title}">
        </div>
        <h3>${anime.title}</h3>
        <p>⭐ ${anime.score ?? "N/A"}</p>
        <div class="actions">
          <button data-id="${anime.mal_id}" data-title="${anime.title}" data-img="${anime.images.jpg.image_url}" class="watch-btn">Add to Watchlist</button>
          <button class="details-btn" data-id="${anime.mal_id}">View Details</button>
        </div>
      </article>
    `).join("")

    initCarousel(".carousel-track")

    track.querySelectorAll(".watch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const anime = { id: btn.dataset.id, title: btn.dataset.title, img: btn.dataset.img }
        const watchlist = getItem("watchlist")
        if (!watchlist.find(item => item.id === anime.id)) {
          watchlist.push(anime)
          setItem("watchlist", watchlist)
        }
      })
    })

    track.querySelectorAll(".details-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault()
        renderPage("details", btn.dataset.id)
      })
    })
  } catch (err) {
    console.error("Error loading anime:", err)
    track.innerHTML = `<p class="error">Failed to load data.</p>`
    disableCarousel()
  }
}

async function loadGenres() {
  const track = document.querySelector(".carousel-track")
  if (!track) return

  track.innerHTML = `<div class="loader"></div>`

  try {
    const data = await getData("/genres/anime")
    const items = data?.data ?? []
    if (!items.length) {
      track.innerHTML = `<p class="error">No genres found.</p>`
      disableCarousel()
      return
    }

    track.innerHTML = items.map(g =>
      `<button class="genre-btn" data-id="${g.mal_id}">${g.name}</button>`
    ).join("")

    disableCarousel()

    track.querySelectorAll(".genre-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        loadAnime(`/anime?genres=${btn.dataset.id}&limit=20`)
      })
    })

  } catch (err) {
    console.error("Error loading genres:", err)
    track.innerHTML = `<p class="error">Failed to load genres.</p>`
    disableCarousel()
  }
}

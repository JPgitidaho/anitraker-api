import { getData } from "./api.mjs"
import { getSeasonalTop } from "./anilist.mjs"
import { addToList, truncateText, cleanDescription } from "./storage.mjs"
import { renderPage } from "./ui.mjs"
import { initCarousel, disableCarousel } from "./carousel.mjs"


export async function renderHome() {
  const app = document.getElementById("app")
  app.innerHTML = `<div class="loader"></div>`

  const aniListData = await getSeasonalTop()
  const topAnimes = aniListData ?? []

  if (!topAnimes.length) {
    app.innerHTML = `<p class="error">Failed to load data from AniList.</p>`
    return
  }

  let current = 0

  const renderShell = (anime) => {
    const img = anime.coverImage.large
    const title = anime.title.english || anime.title.romaji
    const description = cleanDescription(anime.description ?? "No synopsis available.")

    app.innerHTML = `
      <section class="hero" style="--hero-img: url('${img}')">
        <img class="hero-img" src="${img}" alt="${title}">
        <div class="hero-contain">
          <h2>${title}</h2>
          <p>${truncateText(description, 220)}</p>
          <button class="details-btn" data-title="${title}">View Details</button>
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
        <button data-cat="anilist">Top 10</button>
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

    document.querySelector(".details-btn").addEventListener("click", async () => {
      await openDetailsFromAniList(title)
    })

    const searchInput = document.getElementById("search")
    const searchBtn = document.getElementById("search-btn")
    const doSearch = () => {
      const term = searchInput.value.trim()
      if (term) loadAnime(`/anime?q=${encodeURIComponent(term)}&limit=20`)
    }
    searchInput.addEventListener("keypress", e => e.key === "Enter" && doSearch())
    searchBtn.addEventListener("click", doSearch)

    const categories = document.querySelector(".categories")
    categories.querySelector('[data-cat="anilist"]').addEventListener("click", () => loadAniListSeasonal())
    categories.querySelector('[data-cat="trending"]').addEventListener("click", () => loadAnime("/top/anime?limit=20"))
    categories.querySelector('[data-cat="seasonal"]').addEventListener("click", () => loadAnime("/seasons/now?limit=20"))
    categories.querySelector('[data-cat="genres"]').addEventListener("click", () => loadGenres())
  }

  const updateHeroOnly = (anime) => {
    const hero = document.querySelector(".hero")
    const img = hero.querySelector(".hero-img")
    const title = hero.querySelector("h2")
    const desc = hero.querySelector("p")
    const btn = hero.querySelector(".details-btn")

    if (hero) hero.style.setProperty("--hero-img", `url('${anime.coverImage.large}')`)
    if (img) img.src = anime.coverImage.large
    if (title) title.textContent = anime.title.english || anime.title.romaji
    if (desc) desc.textContent = truncateText(cleanDescription(anime.description ?? "No synopsis available."), 220)
    if (btn) btn.dataset.title = anime.title.english || anime.title.romaji
  }

  renderShell(topAnimes[current])
  setInterval(() => {
    current = (current + 1) % topAnimes.length
    updateHeroOnly(topAnimes[current])
  }, 7000)

  loadAniListSeasonal()
}

async function openDetailsFromAniList(title) {
  const data = await getData(`/anime?q=${encodeURIComponent(title)}&limit=1`)
  const match = data?.data?.[0]
  if (match) renderPage("details", match.mal_id)
  else alert("Details not available for this anime.")
}

async function loadAniListSeasonal() {
  const track = document.querySelector(".carousel-track")
  if (!track) return
  track.innerHTML = `<div class="loader"></div>`

  try {
    const items = await getSeasonalTop()
    if (!items.length) {
      track.innerHTML = `<p class="error">No results from AniList.</p>`
      return
    }

    track.innerHTML = items.map(anime => `
      <article class="card">
        <div class="card-image">
          <img src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}">
        </div>
        <h3>${anime.title.english || anime.title.romaji}</h3>
        <p>⭐ ${anime.averageScore ?? "N/A"}</p>
        <div class="actions">
          <button class="details-btn" data-title="${anime.title.english || anime.title.romaji}">View Details</button>
        </div>
      </article>
    `).join("")

    initCarousel(".carousel-track")

    track.querySelectorAll(".details-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await openDetailsFromAniList(btn.dataset.title)
      })
    })
  } catch (err) {
    console.error("AniList error:", err)
    track.innerHTML = `<p class="error">Failed to load AniList data.</p>`
  }
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
        addToList("watchlist", anime)
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
      return
    }

   
    track.innerHTML = `
      <div class="genres-grid">
        ${items
          .map(
            g => `
            <button class="genre-btn" data-id="${g.mal_id}">
              ${g.name}
            </button>`
          )
          .join("")}
      </div>
    `

  
    const grid = track.querySelector(".genres-grid")
    grid.style.display = "flex"
    grid.style.flexWrap = "wrap"
    grid.style.gap = "0.5rem"
    grid.style.justifyContent = "center"

   
    track.querySelectorAll(".genre-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        loadAnime(`/anime?genres=${btn.dataset.id}&limit=20`)
      })
    })
  } catch (err) {
    console.error("Error loading genres:", err)
    track.innerHTML = `<p class="error">Failed to load genres.</p>`
  }
}



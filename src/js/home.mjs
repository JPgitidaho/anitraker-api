import { getTopRatedAnimes, getSeasonalTop, getTrendingAnime } from "./anilist.mjs"
import { truncateText, cleanDescription, isInList } from "./storage.mjs"
import { initCarousel } from "./carousel.mjs"

export async function renderHome() {
  console.log("renderHome is running ✅")
  const app = document.getElementById("app")
  app.innerHTML = `<div class="loader"></div>`

  let animes = await getTopRatedAnimes()

  animes = animes.filter(a => a.bannerImage)

 
  if (!animes.length) {
    console.warn("No animes with bannerImage found, using fallback data")
    animes = [
      {
        title: { english: "Solo Leveling", romaji: "Ore dake Level Up na Ken" },
        description:
          "In a world where hunters battle monsters, Jinwoo Sung rises as the world's strongest.",
        bannerImage: "https://cdn.myanimelist.net/images/anime/1815/142017l.jpg",
        averageScore: 89,
      },
      {
        title: {
          english: "Attack on Titan Final Season",
          romaji: "Shingeki no Kyojin",
        },
        description:
          "Humanity fights for survival against terrifying Titans in a brutal world.",
        bannerImage: "https://cdn.myanimelist.net/images/anime/1000/110531l.jpg",
        averageScore: 95,
      },
    ]
  }

  animes = animes.slice(0, 5)

  let current = 0

  const renderHero = (anime) => {
    const img = anime.bannerImage
    const title = anime.title.english || anime.title.romaji
    const description = cleanDescription(anime.description ?? "No synopsis available.")

    app.innerHTML = `
      <section class="hero" style="--hero-img: url('${img}')">
        <img class="hero-img" src="${img}" alt="${title}">
        <div class="hero-contain">
          <h2>${title}</h2>
          <p>${truncateText(description, 220)}</p>
        </div>
      </section>

      <section class="carousel-container">
        <h3 class="subt">🔥 Most Popular This Season</h3>
        <button class="carousel-btn left">❮</button>
        <div id="anime-list" class="cards carousel-track"></div>
        <button class="carousel-btn right">❯</button>
      </section>
    `
  }

  const updateHero = (anime) => {
    const hero = document.querySelector(".hero")
    const img = hero.querySelector(".hero-img")
    const title = hero.querySelector("h2")
    const desc = hero.querySelector("p")
    const newImg = anime.bannerImage
    if (hero) hero.style.setProperty("--hero-img", `url('${newImg}')`)
    if (img) img.src = newImg
    if (title) title.textContent = anime.title.english || anime.title.romaji
    if (desc)
      desc.textContent = truncateText(
        cleanDescription(anime.description ?? ""),
        220
      )
  }

renderHero(animes[current])

const interval = setInterval(() => {
  const hero = document.querySelector(".hero")
  if (!hero) {
    clearInterval(interval) 
    return
  }
  current = (current + 1) % animes.length
  updateHero(animes[current])
}, 7000)

  await renderCarousel()
  await renderMiniHero()
}

async function renderCarousel() {
  const track = document.querySelector(".carousel-track")
  if (!track) return
  track.innerHTML = `<div class="loader"></div>`

  const items = await getSeasonalTop()
  if (!items || !items.length) {
    track.innerHTML = `<p class="error">No data for this season.</p>`
    return
  }

  track.innerHTML = items
    .map((anime) => {
      const id = anime.idMal || anime.id
      const title = anime.title.english || anime.title.romaji
      const img = anime.coverImage.large

      return `
      <article class="card">
        <div class="card-image">
          <img src="${img}" alt="${title}">
        </div>
        <h3>${title}</h3>
        <div class="actions">
          <button 
            class="icon-btn watchlist-toggle" 
            aria-label="Add to Watchlist"
            data-id="${id}" 
            data-title="${title}" 
            data-img="${img}"
            data-tooltip="${isInList('watchlist', id) ? 'In watchlist' : 'Add to watchlist'}">
            ${isInList('watchlist', id)
              ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/></svg>`
              : `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/><path d="M12 8v6M9 11h6"/></svg>`}
          </button>
          <button 
            class="icon-btn fav-btn" 
            aria-label="Add to Favorites"
            data-id="${id}" 
            data-title="${title}" 
            data-img="${img}" 
            data-tooltip="${isInList('favorites', id) ? 'In favorites' : 'Add to favorites'}">
            ${isInList('favorites', id)
              ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="22" height="22"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12.1 8.64l-.1.1-.11-.1C10.14 6.7 7.1 6.7 5.1 8.7c-2 2-2 5.2 0 7.2l6.9 6.9 6.9-6.9c2-2 2-5.2 0-7.2-2-2-5.04-2-7 0z"/></svg>`}
          </button>
          <a class="details-btn" data-id="${id}" data-tooltip="View details">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </a>
        </div>
      </article>`
    })
    .join("")

  initCarousel(".carousel-track")

  
  const { createWatchlistToggle, createFavoriteToggle } = await import("./storage.mjs")
  const { renderPage } = await import("./ui.mjs")

  document.querySelectorAll(".watchlist-toggle").forEach(btn => createWatchlistToggle(btn))
  document.querySelectorAll(".fav-btn").forEach(btn => createFavoriteToggle(btn))
  document.querySelectorAll(".details-btn").forEach(btn =>
    btn.addEventListener("click", () => renderPage("details", btn.dataset.id))
  )
}

async function renderMiniHero() {
  const trending = await getTrendingAnime()
  if (!trending) {
    console.warn("No trending anime found")
    return
  }

const banner = trending.bannerImage
const fallback =
  trending.coverImage?.extraLarge ||
  trending.coverImage?.large ||
  "/images/placeholder.jpg"

  const img = banner || fallback
  const title = trending.title.english || trending.title.romaji

  const container = document.createElement("section")
  container.classList.add("mini-hero")
  container.style.backgroundImage = `url('${img}')`
  container.innerHTML = `
    <div class="mini-hero-content">
      <h3>🔥 Trending Now</h3>
      <h2>${title}</h2>
    </div>
  `

  const app = document.getElementById("app")
  app.appendChild(container)

  console.log("Mini Hero image used:", img)
}



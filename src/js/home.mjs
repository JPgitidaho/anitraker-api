import { getTopRatedAnimes, getSeasonalTop, getTrendingAnime } from "./anilist.mjs"
import { truncateText, cleanDescription } from "./storage.mjs"
import { initCarousel } from "./carousel.mjs"

export async function renderHome() {
  console.log("renderHome is running ✅")
  const app = document.getElementById("app")
  app.innerHTML = `<div class="loader"></div>`

  let animes = await getTopRatedAnimes()

  // ✅ Filter: only animes with a valid bannerImage
  animes = animes.filter(a => a.bannerImage)

  // ✅ Fallback if none have bannerImage
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

  // ✅ Limit to top 5 banners for hero rotation
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
          <button class="details-btn" disabled>Details</button>
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
  setInterval(() => {
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
    .map(
      (anime) => `
      <article class="card">
        <div class="card-image">
          <img src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}">
        </div>
        <h3>${anime.title.english || anime.title.romaji}</h3>
        <p>⭐ ${anime.averageScore ?? "N/A"}</p>
      </article>
    `
    )
    .join("")

  initCarousel(".carousel-track")
}

async function renderMiniHero() {
  const trending = await getTrendingAnime()
  if (!trending) {
    console.warn("No trending anime found")
    return
  }

  const img = trending.bannerImage || trending.coverImage.large
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
}

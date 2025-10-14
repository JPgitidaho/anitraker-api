import { getData } from "./api.mjs"
import { fetchAniList } from "./anilist.mjs"
import { isInList, createWatchlistToggle, createFavoriteToggle, truncateText } from "./storage.mjs"
import { initCarousel } from "./carousel.mjs"
import { openCharacterModal } from "./characters-modal.mjs"
import { renderPage } from "./ui.mjs"

export async function renderDetails(id) {
  const app = document.getElementById("app")
  app.innerHTML = `<p>Loading details...</p>`

  const [jikanDetails, jikanChars, jikanRecs] = await Promise.all([
    getData(`/anime/${id}`),
    getData(`/anime/${id}/characters`),
    getData(`/anime/${id}/recommendations`)
  ]).catch(() => [null, null, null])

  const aniQuery = `
    query ($id: Int) {
      Media(idMal: $id, type: ANIME) {
        id
        idMal
        title { romaji english native }
        description(asHtml: false)
        coverImage { large extraLarge }
        bannerImage
        averageScore
        episodes
        genres
        seasonYear
        format
        source
        status
        trailer { site id }
        recommendations {
          nodes {
            mediaRecommendation {
              idMal
              title { romaji english }
              averageScore
              coverImage { large }
            }
          }
        }
        characters(perPage: 12) {
          edges {
            role
            node {
              id
              name { full }
              image { large }
            }
          }
        }
      }
    }
  `

  const aniData = await fetchAniList(aniQuery, { id: Number(id) })
  const ani = aniData?.Media
  const jikan = jikanDetails?.data || null

  if (!jikan && !ani) {
    app.innerHTML = `
      <section class="body-details">
        <div class="details-hero">
          <div class="details-content">
            <img class="details-poster" src="/images/placeholder.jpg" alt="Not Found">
            <div class="hero-info">
              <h2 class="hero-title">Details Not Available</h2>
              <p>We couldn’t find information for this anime. Try again later.</p>
            </div>
          </div>
        </div>
      </section>
    `
    return
  }

  const anime = {
    id: ani?.idMal || jikan?.mal_id || id,
    title: ani?.title?.english || ani?.title?.romaji || jikan?.title,
    synopsis: ani?.description || jikan?.synopsis,
    coverImage:
      ani?.coverImage?.large ||
      ani?.bannerImage ||
      jikan?.images?.jpg?.large_image_url ||
      jikan?.images?.jpg?.image_url,
    score: ani?.averageScore || jikan?.score || "N/A",
    episodes: jikan?.episodes || ani?.episodes || "?",
    genres: ani?.genres || jikan?.genres?.map(g => g.name) || [],
    seasonYear: ani?.seasonYear || jikan?.year || "Unknown",
    format: ani?.format || jikan?.type || "Unknown",
    status: ani?.status || jikan?.status || "Unknown",
    trailer: ani?.trailer,
    characters:
      jikanChars?.data?.length
        ? jikanChars.data.map(c => ({
            id: c.character.mal_id,
            name: c.character.name,
            image: c.character.images.jpg.image_url,
            role: c.role
          }))
        : ani?.characters?.edges?.map(c => ({
            id: c.node.id,
            name: c.node.name.full,
            image: c.node.image.large,
            role: c.role
          })) || [],
    recommendations:
      jikanRecs?.data?.length
        ? jikanRecs.data.map(r => ({
            id: r.entry[0]?.mal_id,
            title: r.entry[0]?.title,
            score: r.entry[0]?.score,
            img: r.entry[0]?.images?.jpg?.image_url
          }))
        : ani?.recommendations?.nodes
            ?.map(n => n.mediaRecommendation)
            ?.filter(Boolean)
            ?.map(r => ({
              id: r.idMal,
              title: r.title.english || r.title.romaji,
              score: r.averageScore,
              img: r.coverImage.large
            })) || []
  }

  const title = anime.title || "Untitled"
  const img =
    anime.coverImage ||
    ani?.bannerImage ||
    jikan?.images?.jpg?.large_image_url ||
    jikan?.images?.jpg?.image_url ||
    "/images/placeholder.jpg"

  app.innerHTML = `
    <section class="body-details">
      <div class="details-hero">
        <div class="details-content">
          <img class="details-poster" src="${img}" alt="${title}">
          <div class="actions">
            <button 
              class="icon-btn watchlist-toggle" 
              aria-label="Add to Watchlist"
              data-id="${id}" 
              data-title="${title}" 
              data-img="${img}"
              data-tooltip="${isInList('watchlist', id) ? 'In watchlist' : 'Add to watchlist'}">
            </button>
            <button 
              class="icon-btn fav-btn" 
              aria-label="Add to Favorites"
              data-id="${id}" 
              data-title="${title}" 
              data-img="${img}" 
              data-tooltip="${isInList("favorites", id) ? "In favorites" : "Add to favorites"}">
            </button>
          </div>
        </div>
        <div class="hero-info">
          <h2 class="hero-title">${title}</h2>
          <p>${truncateText(anime.synopsis ?? "No synopsis available.", 350)}</p>
          <div class="genres">
            ${anime.genres.map(g => `<span class="chip">${g}</span>`).join("")}
          </div>
          <p>⭐ ${anime.score}</p>
          <p>📅 ${anime.seasonYear}</p>
          <p>📺 Episodes: ${anime.episodes}</p>
          <p>📡 Status: ${anime.status}</p>
        </div>
      </div>

      <section class="character">
        <h3>Characters</h3>
        <section class="carousel-container">
          <button class="carousel-btn left">❮</button>
          <div class="cards carousel-track character-list">
            ${
              anime.characters.length
                ? anime.characters
                    .map(
                      c => `
              <div class="card character" data-id="${c.id}">
                <div class="card-image">
                  <img src="${c.image}" alt="${c.name}">
                </div>
                <h4>${c.name}</h4>
                <p class="role">${c.role}</p>
                <button class="view-more-btn">View More</button>
              </div>`
                    )
                    .join("")
                : "<p class='error'>No characters available.</p>"
            }
          </div>
          <button class="carousel-btn right">❯</button>
        </section>
      </section>

      <section class="recommended">
        <h3>Recommended</h3>
        <section class="carousel-container">
          <button class="carousel-btn left">❮</button>
          <div class="cards carousel-track recommended-list">
            ${
              anime.recommendations.length
                ? anime.recommendations
                    .map(
                      r => `
              <article class="card" data-id="${r.id}">
                <div class="card-image">
                  <img src="${r.img}" alt="${r.title}">
                </div>
                <h3>${r.title}</h3>
                <p>⭐ ${r.score ?? "N/A"}</p>
              </article>`
                    )
                    .join("")
                : "<p class='error'>No recommendations available.</p>"
            }
          </div>
          <button class="carousel-btn right">❯</button>
        </section>
      </section>
    </section>
  `

  const wlBtn = document.querySelector(".watchlist-toggle")
  const favBtn = document.querySelector(".fav-btn")

  if (wlBtn) createWatchlistToggle(wlBtn)
  if (favBtn) createFavoriteToggle(favBtn)

  initCarousel(".character-list")
  initCarousel(".recommended-list")

  document.querySelectorAll(".view-more-btn").forEach(btn => {
    const card = btn.closest(".character")
    if (card) btn.addEventListener("click", () => openCharacterModal(card.dataset.id))
  })

  document.querySelectorAll(".recommended .card").forEach(card => {
    card.addEventListener("click", () => renderPage("details", card.dataset.id))
  })
}

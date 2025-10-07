import { getData } from "./api.mjs"
import { getItem, setItem } from "./storage.mjs"
import { initCarousel } from "./carousel.mjs"
import { openCharacterModal } from "./characters.mjs"
import { renderPage } from "./ui.mjs"

export async function renderDetails(id) {
  const app = document.getElementById("app")
  app.innerHTML = `<p>Loading details...</p>`

  const details = await getData(`/anime/${id}`)
  const characters = await getData(`/anime/${id}/characters`)
  const recommendations = await getData(`/anime/${id}/recommendations`)

  if (!details || !details.data) {
    app.innerHTML = `<p class="error">Unable to load details.</p>`
    return
  }

  const anime = details.data

  app.innerHTML = `
    <section class="body-details">
      <div class="details-hero"">
        <div class="details-content">     
        <img class="details-poster" src="${anime.images.jpg.image_url}" alt="${anime.title}">
          <div class="hero-actions">
          <button class="watch-btn" data-id="${anime.mal_id}" data-title="${anime.title}" data-img="${anime.images.jpg.image_url}">Add to Watchlist</button>
            ${anime.trailer?.url ? `<a href="${anime.trailer.url}" target="_blank"><button class="trailer-btn">Watch Trailer</button></a>` : ""}
          </div>
        </div>
        <div class="hero-info">
          <h2 class ="hero-title">${anime.title}</h2>
          <p>${anime.synopsis ?? "No synopsis available."}</p>
          <div class="genres">
            ${(anime.genres ?? []).map(g => `<span class="chip">${g.name}</span>`).join("")} 
          </div>
             ${anime.source === "Manga" ? `<p class="hero-manga">📖 Based on a Manga</p>` : ""}
          <p>⭐ ${anime.score ?? "" }</p>


        </div>      
      </div>
      <section class="characters">
        <h3>Characters</h3>
        <section class="carousel-container">
          <button class="carousel-btn left">❮</button>
          <div class="cards carousel-track character-list">
            ${characters && characters.data
      ? characters.data.slice(0, 50).map(c => `
                  <div class="card character-card" data-id="${c.character.mal_id}">
                    <div class="card-image">
                      <img src="${c.character.images.jpg.image_url}" alt="${c.character.name}">
                    </div>
                    <h4>${c.character.name}</h4>
                    <p class="role">${c.role}</p>
                    <button class="view-more-btn">View More</button>
                  </div>
                `).join("")
      : "<p>No characters available.</p>"
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
            ${recommendations && recommendations.data
      ? recommendations.data.slice(0, 10).map(r => `
                  <article class="card recommended-card" data-id="${r.entry.mal_id}">
                    <div class="card-image">
                      <img src="${r.entry.images.jpg.image_url}" alt="${r.entry.title}">
                    </div>
                    <h3>${r.entry.title}</h3>
                    <p>⭐ ${r.entry.score ?? "N/A"}</p>
                  </article>
                `).join("")
      : "<p>No recommendations available.</p>"
    }
          </div>
          <button class="carousel-btn right">❯</button>
        </section>
      </section>
    </section>
  `

  const watchBtn = document.querySelector(".watch-btn")
  if (watchBtn) {
    watchBtn.addEventListener("click", () => {
      const animeData = { id: watchBtn.dataset.id, title: watchBtn.dataset.title, img: watchBtn.dataset.img }
      const list = getItem("watchlist")
      if (!list.find(i => i.id === animeData.id)) {
        list.push(animeData)
        setItem("watchlist", list)
      }
    })
  }

  initCarousel(".character-list")
  initCarousel(".recommended-list")

  document.querySelectorAll(".character-card").forEach(card => {
    card.addEventListener("click", e => {
      if (!e.target.classList.contains("view-more-btn")) return
      const cid = card.dataset.id
      openCharacterModal(cid)
    })
  })

  const recList = document.querySelector(".recommended-list")
  if (recList) {
    recList.addEventListener("click", e => {
      const card = e.target.closest(".recommended-card")
      if (!card) return
      const rid = card.dataset.id
      if (rid) renderPage("details", rid)
    })
  }
}

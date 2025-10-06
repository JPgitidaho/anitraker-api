import { getData } from "./api.mjs";

export async function renderDetails(id) {
  const app = document.getElementById("app");
  app.innerHTML = `<p>Loading details...</p>`;

  const details = await getData(`/anime/${id}`);
  const characters = await getData(`/anime/${id}/characters`);
  const recommendations = await getData(`/anime/${id}/recommendations`);

  if (!details || !details.data) {
    app.innerHTML = `<p class="error">Unable to load details.</p>`;
    return;
  }

  const anime = details.data;

  app.innerHTML = `
    <section class="hero-detail">
      <div>
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      </div>
      <div class="hero-info">
        <h2>${anime.title}</h2>
        <p>${anime.synopsis ?? "No synopsis available."}</p>
        <div class="tags">
          ${(anime.genres ?? []).map(g => `<span>${g.name}</span>`).join("")}
        </div>
        <p>⭐ ${anime.score ?? "N/A"}</p>
        <div class="hero-actions">
          <button class="watch-btn">+ Watching</button>
          ${
            anime.trailer?.url
              ? `<a href="${anime.trailer.url}" target="_blank"><button class="trailer-btn">Trailer</button></a>`
              : ""
          }
        </div>
      </div>
    </section>

    <section class="characters">
      <h3>Characters</h3>
      <div class="character-list">
        ${
          characters && characters.data
            ? characters.data
                .slice(0, 6)
                .map(
                  c => `
                <div class="character-card">
                  <img src="${c.character.images.jpg.image_url}" alt="${c.character.name}">
                  <p>${c.character.name}</p>
                </div>`
                )
                .join("")
            : "<p>No characters available.</p>"
        }
      </div>
    </section>

    <section class="recommended">
      <h3>Recommended</h3>
      <div class="recommended-list">
        ${
          recommendations && recommendations.data
            ? recommendations.data
                .slice(0, 4)
                .map(
                  r => `
                <div class="card">
                  <img src="${r.entry.images.jpg.image_url}" alt="${r.entry.title}">
                  <h3>${r.entry.title}</h3>
                </div>`
                )
                .join("")
            : "<p>No recommendations available.</p>"
        }
      </div>
    </section>
  `;
}

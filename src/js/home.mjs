import { getData } from "./api.mjs";
import { getItem, setItem } from "./storage.mjs";
import { renderPage } from "./ui.mjs";

export async function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="hero">
      <h2>Discover Anime</h2>
      <input type="text" id="search" placeholder="Search anime or manga...">
    </section>

    <section class="categories">
      <button data-cat="trending">Trending</button>
      <button data-cat="seasonal">Seasonal</button>
      <button data-cat="genres">Genres</button>
    </section>

    <section id="anime-list" class="cards"></section>
  `;

  loadAnime("/top/anime?limit=8");

  const searchInput = document.getElementById("search");
  searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      const term = searchInput.value.trim();
      if (term) {
        loadAnime(`/anime?q=${encodeURIComponent(term)}&limit=8`);
      }
    }
  });

  const catButtons = document.querySelectorAll(".categories button");
  catButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.cat === "trending") {
        loadAnime("/top/anime?limit=8");
      }
      if (btn.dataset.cat === "seasonal") {
        loadAnime("/seasons/now");
      }
      if (btn.dataset.cat === "genres") {
        loadGenres();
      }
    });
  });
}

async function loadAnime(endpoint) {
  const list = document.querySelector("#anime-list");
  list.innerHTML = `<p>Loading...</p>`;

  const data = await getData(endpoint);

  if (data && data.data && data.data.length > 0) {
    list.innerHTML = data.data
      .map(
        anime => `
        <article class="card">
          <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
          <h3>${anime.title}</h3>
          <p>⭐ ${anime.score ?? "N/A"}</p>
          <button data-id="${anime.mal_id}" data-title="${anime.title}" data-img="${anime.images.jpg.image_url}">Add to Watchlist</button>
          <a href="#" class="details-link" data-id="${anime.mal_id}">View Details</a>
        </article>
      `
      )
      .join("");

    const buttons = list.querySelectorAll("button[data-id]");
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const anime = {
          id: btn.dataset.id,
          title: btn.dataset.title,
          img: btn.dataset.img
        };
        const watchlist = getItem("watchlist");
        if (!watchlist.find(item => item.id === anime.id)) {
          watchlist.push(anime);
          setItem("watchlist", watchlist);
        }
      });
    });

    const detailLinks = list.querySelectorAll(".details-link");
    detailLinks.forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        renderPage("details", link.dataset.id);
      });
    });
  } else {
    list.innerHTML = `<p class="error">No results found.</p>`;
  }
}

async function loadGenres() {
  const list = document.querySelector("#anime-list");
  list.innerHTML = `<p>Loading genres...</p>`;

  const data = await getData("/genres/anime");
  if (data && data.data) {
    list.innerHTML = data.data
      .map(
        g => `<button class="genre-btn" data-id="${g.mal_id}">${g.name}</button>`
      )
      .join("");

    const genreBtns = document.querySelectorAll(".genre-btn");
    genreBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        loadAnime(`/anime?genres=${btn.dataset.id}&limit=8`);
      });
    });
  }
}

import { getItem, setItem } from "./storage.mjs";

export async function renderWatchlist() {
  const app = document.getElementById("app");
  const list = getItem("watchlist");

  app.innerHTML = `
    <section class="hero">
      <h2>Your Watchlist</h2>
    </section>
    <section id="watchlist" class="cards"></section>
  `;

  const container = document.querySelector("#watchlist");
  if (list.length > 0) {
    container.innerHTML = list
      .map(
        anime => `
        <article class="card">
          <img src="${anime.img}" alt="${anime.title}">
          <h3>${anime.title}</h3>
          <button data-id="${anime.id}" class="remove-btn">Remove</button>
        </article>
      `
      )
      .join("");

    const removeBtns = container.querySelectorAll(".remove-btn");
    removeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const updated = list.filter(item => item.id !== btn.dataset.id);
        setItem("watchlist", updated);
        renderWatchlist();
      });
    });
  } else {
    container.innerHTML = `<p class="error">Your watchlist is empty.</p>`;
  }
}

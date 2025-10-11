import { renderPage } from "./ui.mjs"

export async function initSearchModal() {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const html = await fetch("/partials/search-modal.html").then(res => res.text())
  container.innerHTML = html

  const openBtn = document.getElementById("search-btn")
  const overlay = document.getElementById("search-overlay")
  const closeBtn = document.getElementById("close-search")
  const input = document.getElementById("search-input")
  const results = document.getElementById("search-results")

  if (!openBtn || !overlay) return

  openBtn.addEventListener("click", () => {
    overlay.classList.remove("hidden")
    document.body.classList.add("no-scroll")
    input.focus()
  })

  const closeModal = () => {
    overlay.classList.add("hidden")
    document.body.classList.remove("no-scroll")
    input.value = ""
    results.innerHTML = ""
  }

  closeBtn.addEventListener("click", closeModal)
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeModal()
  })
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal()
  })

  let handle
  input.addEventListener("input", async e => {
    const q = e.target.value.trim()
    results.innerHTML = ""
    if (handle) clearTimeout(handle)
    handle = setTimeout(async () => {
      if (q.length < 3) return
      const items = await import("./anilist.mjs").then(m => m.searchAnimes(q))
      results.innerHTML = items
        .map(
          a => `
        <div class="result-item" data-id="${a.id}">
          <img src="${a.coverImage.large}" alt="${a.title.english || a.title.romaji}">
          <span>${a.title.english || a.title.romaji}</span>
        </div>`
        )
        .join("")
    }, 250)
  })

  results.addEventListener("click", e => {
    const card = e.target.closest(".result-item")
    if (!card) return
    const id = card.dataset.id
    closeModal()
    renderPage("details", id)
  })
}

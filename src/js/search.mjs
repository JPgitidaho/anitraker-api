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

      const { searchAnimes } = await import("./anilist.mjs")
      const { getData } = await import("./api.mjs")

    
      const aniResults = await searchAnimes(q)

     
      const merged = await Promise.all(
        aniResults.map(async a => {
          const title = a.title.english || a.title.romaji
          const jikan = await getData(`/anime?q=${encodeURIComponent(title)}&limit=1`)
          const mal_id = jikan?.data?.[0]?.mal_id
          return {
            id: mal_id || a.idMal || a.id, 
            title
          }
        })
      )

     
      results.innerHTML = merged
        .filter(r => r.id) 
        .map(r => `<div class="result-item" data-id="${r.id}">${r.title}</div>`)
        .join("") || "<p class='error'>No results found.</p>"
    }, 300)
  })

  results.addEventListener("click", async e => {
    const item = e.target.closest(".result-item")
    if (!item) return
    const id = item.dataset.id
    closeModal()
    const { renderPage } = await import("./ui.mjs")
    renderPage("details", id)
  })
}

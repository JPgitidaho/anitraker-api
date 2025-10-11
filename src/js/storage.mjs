// Get an item from localStorage
export function getItem(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Save an item to localStorage
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error("Storage error:", err)
  }
}

// Add item to a list (e.g. watchlist or favorites)
export function addToList(key, item) {
  const list = getItem(key)

  // Prevent duplicates (compares stringified IDs)
  const exists = list.some(i => String(i.id) === String(item.id))
  if (exists) return

  list.push(item)
  setItem(key, list)
}

// Check if an item exists in a list
export function isInList(key, id) {
  const list = getItem(key)
  return list.some(i => String(i.id) === String(id))
}

// Toggle favorite (add/remove)
export function toggleFavoriteItem(item) {
  const list = getItem("favorites")
  const exists = list.some(i => String(i.id) === String(item.id))

  let updated
  if (exists) {
    updated = list.filter(i => String(i.id) !== String(item.id))
  } else {
    updated = [...list, item]
  }

  setItem("favorites", updated)
  return !exists // true = now added, false = now removed
}

// Utility to shorten text
export function truncateText(text, length = 200) {
  if (!text) return ""
  return text.length > length ? text.slice(0, length) + "..." : text
}

// Utility to clean HTML tags from API descriptions
export function cleanDescription(text) {
  if (!text) return ""
  return text.replace(/<\/?[^>]+(>|$)/g, "")
}

// Create a toggle button for Watchlist
export function createWatchlistToggle(button) {
  const id = button.dataset.id
  const title = button.dataset.title
  const img = button.dataset.img

  const setWlState = active => {
    button.innerHTML = active
      ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/></svg>`
      : `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
           <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/>
           <path d="M12 8v6M9 11h6"/>
         </svg>`
    button.dataset.tooltip = active ? "In watchlist" : "Add to watchlist"
  }

  let active = isInList("watchlist", id)
  setWlState(active)

  button.addEventListener("click", () => {
    button.disabled = true
    setTimeout(() => (button.disabled = false), 400)

    if (isInList("watchlist", id)) {
      const next = getItem("watchlist").filter(i => String(i.id) !== String(id))
      setItem("watchlist", next)
      active = false
    } else {
      addToList("watchlist", { id, title, img })
      active = true
    }
    setWlState(active)
  })
}

// Create a toggle button for Favorites
export function createFavoriteToggle(button) {
  const id = button.dataset.id
  const title = button.dataset.title
  const img = button.dataset.img

  const setFavState = active => {
    button.innerHTML = active
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="22" height="22">
           <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
           2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
           C13.09 3.81 14.76 3 16.5 3 
           19.58 3 22 5.42 22 8.5
           c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
           <path d="M12.1 8.64l-.1.1-.11-.1
           C10.14 6.7 7.1 6.7 5.1 8.7
           c-2 2-2 5.2 0 7.2l6.9 6.9
           6.9-6.9c2-2 2-5.2 0-7.2
           -2-2-5.04-2-7 0z"/>
         </svg>`
    button.dataset.tooltip = active ? "In favorites" : "Add to favorites"
  }

  let active = isInList("favorites", id)
  setFavState(active)

  button.addEventListener("click", () => {
    button.disabled = true
    setTimeout(() => (button.disabled = false), 400)

    if (isInList("favorites", id)) {
      const next = getItem("favorites").filter(i => String(i.id) !== String(id))
      setItem("favorites", next)
      active = false
    } else {
      addToList("favorites", { id, title, img })
      active = true
    }
    setFavState(active)
  })
}

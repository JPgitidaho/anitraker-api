export function getItem(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}


export function setItem(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function addToList(key, item) {
  const list = getItem(key)
  if (!list.find(i => i.id === item.id)) {
    list.push(item)
    setItem(key, list)
  }
}

export function removeFromList(key, id) {
  const list = getItem(key).filter(i => i.id !== id)
  setItem(key, list)
}

export function isInList(key, id) {
  return getItem(key).some(i => i.id === id)
}

export function cleanList(key, predicate) {
  const cleaned = getItem(key).filter(predicate)
  setItem(key, cleaned)
  return cleaned
}

export function toggleFavoriteItem(item) {
  const list = getItem("favorites")
  const exists = list.find(i => i.id === item.id)
  if (exists) {
    const updated = list.filter(i => i.id !== item.id)
    setItem("favorites", updated)
    return false
  } else {
    list.push(item)
    setItem("favorites", list)
    return true
  }
}

export function truncateText(text, maxLength) {
  return text?.length > maxLength ? text.substring(0, maxLength) + "..." : text
}

export function cleanDescription(text) {
  if (!text) return ""
  return text.replace(/<\/?[^>]+(>|$)/g, "")
}

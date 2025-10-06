export function getItem(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

export function setItem(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

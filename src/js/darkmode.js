export function initDarkModeToggle() {
  const toggle = document.createElement("button")
  toggle.classList.add("theme-toggle")

  const current = localStorage.getItem("theme") || "light"
  const isDark = current === "dark"
  document.body.classList.toggle("dark", isDark)
  toggle.textContent = isDark ? "☀️" : "🌙"
  document.body.appendChild(toggle)

  toggle.addEventListener("click", () => {
    const nowDark = document.body.classList.toggle("dark")
    toggle.textContent = nowDark ? "☀️" : "🌙"
    localStorage.setItem("theme", nowDark ? "dark" : "light")
  })
}

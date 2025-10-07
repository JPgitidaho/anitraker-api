export function initDarkModeToggle() {
  const toggle = document.createElement("button")
  toggle.textContent = "☀️"
  toggle.classList.add("theme-toggle")
  document.body.appendChild(toggle)

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark")
    toggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙"
  })
}

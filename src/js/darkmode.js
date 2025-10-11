export function initDarkModeToggle() {
  const toggle = document.createElement("button")
  toggle.classList.add("theme-toggle")

  const sunIcon = `
 <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
</svg>
  `

  const moonIcon = `
<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
</svg>

  `

  const isDark = localStorage.getItem("theme") === "dark"
  document.body.classList.toggle("dark", isDark)
  toggle.innerHTML = isDark ? sunIcon : moonIcon
  document.body.appendChild(toggle)

  toggle.addEventListener("click", () => {
    const nowDark = document.body.classList.toggle("dark")
    toggle.innerHTML = nowDark ? sunIcon : moonIcon
    localStorage.setItem("theme", nowDark ? "dark" : "light")
  })
}

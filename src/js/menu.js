export function initMenuToggle() {
  const toggle = document.querySelector(".menu-toggle")
  const nav = document.querySelector(".desktop-nav")
  if (!toggle || !nav) return

  let overlay = document.querySelector(".menu-overlay")
  if (!overlay) {
    overlay = document.createElement("div")
    overlay.classList.add("menu-overlay")
    document.body.appendChild(overlay)
  }

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open")
    toggle.textContent = open ? "✕" : "☰"
    overlay.classList.toggle("show", open)
    document.body.classList.toggle("no-scroll", open)
  })

  overlay.addEventListener("click", () => {
    nav.classList.remove("open")
    overlay.classList.remove("show")
    document.body.classList.remove("no-scroll")
    toggle.textContent = "☰"
  })
}

export function initDropdownMenu() {
  const dropdown = document.querySelector(".dropdown")
  const toggle = dropdown?.querySelector(".dropdown-toggle")
  if (!dropdown || !toggle) return

  toggle.addEventListener("click", e => {
    e.preventDefault()
    dropdown.classList.toggle("active")
  })

  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("active")
  })
}

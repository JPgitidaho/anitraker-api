import { initDropdownMenu } from "./menu.js"

export async function initUI() {
  await loadPartial("header", "/partials/header.html")
  await loadPartial("footer", "/partials/footer.html")
  initDropdownMenu()
}

async function loadPartial(id, path) {
  const res = await fetch(path)
  const html = await res.text()
  const container = document.createElement("div")
  container.innerHTML = html
  if (id === "header") {
    document.body.insertBefore(container, document.body.firstChild)
    initHamburgerMenu()
  } else if (id === "footer") {
    document.body.appendChild(container)
  }
  return container
}


function initHamburgerMenu() {
  const toggle = document.querySelector(".menu-toggle")
  const nav = document.querySelector(".desktop-nav")
  if (!toggle || !nav) return

  const overlay = document.createElement("div")
  overlay.classList.add("menu-overlay")
  document.body.appendChild(overlay)

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

export function initCarousel(trackSelector) {
  const track = document.querySelector(trackSelector)
  if (!track) return

  const container = track.closest(".carousel-container")
  if (!container) return

  const btnLeft = container.querySelector(".carousel-btn.left")
  const btnRight = container.querySelector(".carousel-btn.right")

  if (!btnLeft || !btnRight) return

  btnLeft.classList.remove("hidden")
  btnRight.classList.remove("hidden")

  btnLeft.onclick = () => track.scrollBy({ left: -300, behavior: "smooth" })
  btnRight.onclick = () => track.scrollBy({ left: 300, behavior: "smooth" })
}

export function disableCarousel() {
  document.querySelectorAll(".carousel-btn").forEach(btn => {
    btn.classList.add("hidden")
  })
}

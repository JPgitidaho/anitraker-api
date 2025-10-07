import { getData } from "./api.mjs"

export async function openCharacterModal(id) {
  try {
    const data = await getData(`/characters/${id}`)
    if (!data || !data.data) {
      alert("Unable to load character details.")
      return
    }

    const char = data.data

    const modal = document.createElement("div")
    modal.classList.add("character-modal-overlay")

    modal.innerHTML = `
      <div class="character-modal">
        <button class="close-modal">&times;</button>
        <div class="modal-content">
          <div class="modal-left">
            <img src="${char.images.jpg.image_url}" alt="${char.name}">
          </div>
          <div class="modal-right">
            <h2>${char.name}</h2>
            ${char.name_kanji ? `<p class="kanji">${char.name_kanji}</p>` : ""}
            ${
              char.nicknames && char.nicknames.length
                ? `<p class="nicknames">Also known as: ${char.nicknames.join(", ")}</p>`
                : ""
            }
            ${
              char.about
                ? `<p class="about">${char.about.replace(/\n/g, "<br>")}</p>`
                : "<p>No description available.</p>"
            }
            <p class="favorites">❤️ Favorites: ${char.favorites ?? 0}</p>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    const closeBtn = modal.querySelector(".close-modal")
    closeBtn.addEventListener("click", () => closeCharacterModal(modal))

    modal.addEventListener("click", e => {
      if (e.target === modal) closeCharacterModal(modal)
    })
  } catch (err) {
    console.error("Error loading character:", err)
  }
}

function closeCharacterModal(modal) {
  modal.classList.add("fade-out")
  setTimeout(() => modal.remove(), 300)
}

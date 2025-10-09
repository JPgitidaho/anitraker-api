const baseURL = "https://graphql.anilist.co"

export async function fetchAniList(query, variables = {}) {
  try {
    const res = await fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.errors?.[0]?.message || "AniList error")
    return json.data
  } catch (err) {
    console.error("AniList API Error:", err)
    return null
  }
}

export async function getSeasonalTop() {
  const query = `
    query {
      Page(page:1, perPage:10) {
        media(season: FALL, seasonYear: 2025, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          description(asHtml: false)
          coverImage {
            large
          }
          averageScore
        }
      }
    }
  `
  const data = await fetchAniList(query)
  return data?.Page?.media ?? []
}

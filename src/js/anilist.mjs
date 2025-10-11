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

export async function getTopRatedAnimes() {
  const query = `
    query {
      Page(page: 1, perPage: 25) {
        media(
          type: ANIME,
          sort: SCORE_DESC,
          averageScore_greater: 80,
          popularity_greater: 1000
        ) {
          id
          title {
            romaji
            english
          }
          description(asHtml: false)
          bannerImage
          coverImage {
            extraLarge
          }
          averageScore
        }
      }
    }
  `
  const data = await fetchAniList(query)
  return data?.Page?.media ?? []
}

// Top 10 popular animes of the current season (for carousel)
export async function getSeasonalTop() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const season =
    month >= 3 && month <= 5
      ? "SPRING"
      : month >= 6 && month <= 8
      ? "SUMMER"
      : month >= 9 && month <= 11
      ? "FALL"
      : "WINTER"

  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(page: 1, perPage: 10) {
        media(
          season: $season,
          seasonYear: $year,
          type: ANIME,
          sort: POPULARITY_DESC
        ) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
        }
      }
    }
  `
  const variables = { season, year }
  const data = await fetchAniList(query, variables)
  return data?.Page?.media ?? []
}
export async function getTrendingAnime() {
  const query = `
    query {
      Page(page: 1, perPage: 1) {
        media(
          type: ANIME,
          sort: TRENDING_DESC
        ) {
          id
          title {
            english
            romaji
          }
          coverImage {
            extraLarge
          }
          bannerImage
          averageScore
        }
      }
    }
  `
  const data = await fetchAniList(query)
  return data?.Page?.media?.[0]
}

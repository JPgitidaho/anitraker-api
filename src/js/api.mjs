const baseURL = "https://api.jikan.moe/v4";

export async function getData(endpoint) {
  try {
    const response = await fetch(`${baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}

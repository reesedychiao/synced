export default async function handler(req, res) {
  const { title, year } = req.query;

  if (!title) {
    return res.status(400).json({ error: "Missing title" });
  }

  const query = `track:${title}${year ? ` year:${year}` : ""}`;

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenRes.json();

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const searchData = await searchRes.json();
    const track = searchData?.tracks?.items?.[0];

    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    res.status(200).json({
      albumCover: track.album.images?.[0]?.url ?? null,
      previewUrl: track.preview_url ?? null,
      externalUrl: track.external_urls?.spotify ?? null,
      artists: track.artists?.map((a) => a.name).join(", ") ?? null,
      spotifyId: track.id,
    });
  } catch (err) {
    console.error("🔥 Spotify API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

import querystring from "querystring";

export default async function handler(req, res) {
  const { title, artist } = req.query;

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: querystring.stringify({
      grant_type: "client_credentials",
    }),
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const searchQuery = `${title} ${artist}`;
  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      searchQuery
    )}&type=track&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const searchData = await searchResponse.json();

  if (!searchData.tracks.items.length) {
    return res.status(404).json({ message: "No song found" });
  }

  const song = searchData.tracks.items[0];

  return res.status(200).json({
    albumCover: song.album.images[0]?.url || null,
    previewUrl: song.preview_url || null,
  });
}

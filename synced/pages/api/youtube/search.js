export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      q
    )}&type=video&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`;

    const youtubeRes = await fetch(url);

    if (!youtubeRes.ok) {
      const errorText = await youtubeRes.text();
      console.error("YouTube API error response:", errorText);
      return res
        .status(youtubeRes.status)
        .json({ error: "YouTube API call failed" });
    }

    const data = await youtubeRes.json();

    if (!data.items || data.items.length === 0) {
      console.warn("No results for query:", q);
      return res.status(404).json({ error: "No videos found" });
    }

    const videoId = data.items[0].id.videoId;
    return res.status(200).json({ videoId });
  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

from flask import Blueprint, request, jsonify, g
from .recommender import recommend_songs
import pandas as pd
import os

main = Blueprint("main", __name__)

@main.route("/get_song", methods=["GET"])
def get_song():
    user_id = request.args.get("user_id")

    g.cursor.execute("""
        SELECT s.song_name, s.artist_name, s.spotify_id, s.genre, s.tempo
        FROM songs s
        JOIN user_songs us ON us.song_id = s.id
        WHERE us.user_id = %s;
    """, (user_id,))
    liked = g.cursor.fetchall()

    if not liked:
        return jsonify({"error": "No liked songs"}), 404

    song_list = [{'name': row[0], 'artists': row[1]} for row in liked]
    data = pd.read_csv(os.path.join(os.path.dirname(__file__), "data", "data.csv"))

    recs = recommend_songs(song_list, data, n_songs=1)
    if not recs:
        return jsonify({"error": "No recommendations"}), 404

    return jsonify({
        "title": recs[0]["name"],
        "artist": recs[0]["artists"],
        "year": recs[0]["year"]
    })

@main.route("/swipe", methods=["POST"])
def swipe():
    data = request.json
    user_id = data["user_id"]
    liked = data["liked"]
    title = data["title"]
    artist = data["artist"]

    if liked:
        # You enrich on frontend → we expect the frontend to provide spotify_id
        g.cursor.execute("SELECT id FROM songs WHERE song_name = %s AND artist_name = %s;",
                         (title, artist))
        result = g.cursor.fetchone()
        if result:
            song_id = result[0]
            g.cursor.execute("""
                INSERT INTO user_songs (user_id, song_id)
                VALUES (%s, %s) ON CONFLICT DO NOTHING;
            """, (user_id, song_id))

    g.db.commit()
    return jsonify({"message": "Swipe recorded"}), 200

@main.route("/get_users_faves", methods=["GET"])
def get_users_faves():
    user_id = request.args.get("user_id")
    g.cursor.execute("""
        SELECT s.id, s.song_name, s.artist_name
        FROM songs s
        JOIN user_songs us ON us.song_id = s.id
        WHERE us.user_id = %s;
    """, (user_id,))
    rows = g.cursor.fetchall()
    songs = [{"id": r[0], "title": r[1], "artist": r[2]} for r in rows]
    return jsonify({"user_id": user_id, "saved_songs": songs}), 200

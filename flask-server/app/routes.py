from flask import Blueprint, request, jsonify, g
from .recommender import recommend_songs
import pandas as pd
import os

main = Blueprint("main", __name__)

@main.route("/users", methods=["POST"])
def create_or_verify_user():
    print("/users POST route hit")
    data = request.get_json()

    user_id = data.get("id")
    name = data.get("name")
    email = data.get("email")

    print(f"User login: {user_id}, {name}, {email}")

    if not user_id or not email:
        return jsonify({"error": "Missing required fields"}), 400

    g.cursor.execute("""
        INSERT INTO users (id, username, email)
        VALUES (%s, %s, %s)
        ON CONFLICT (id) DO NOTHING;
    """, (user_id, name, email))

    g.db.commit()
    return jsonify({"message": "User created or verified"}), 200

@main.route("/users/<user_id>/recommendations", methods=["GET"])
def get_recommendations(user_id):
    print(f"[GET] Recommendations requested for user_id={user_id}")
    
    g.cursor.execute("""
        SELECT s.name, s.artists, s.year
        FROM songs s
        JOIN user_songs us ON us.song_id = s.id
        WHERE us.user_id = %s;
    """, (user_id,))
    liked_songs = g.cursor.fetchall()

    print(f"Found {len(liked_songs)} liked songs.")

    DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "data.csv")

    try:
        spotify_data = pd.read_csv(DATA_PATH)
    except Exception as e:
        print(f"Failed to load data.csv: {e}")
        return jsonify({'error': 'Data load failed'}), 500

    if not liked_songs:
        print("No liked songs yet — returning random starter songs.")
        starter = spotify_data.sample(10)
        return jsonify(starter[['name', 'year', 'artists']].to_dict(orient="records")), 200

    song_list = [{'name': row[0], 'artists': row[1]} for row in liked_songs]

    try:
        recs = recommend_songs(song_list, spotify_data, n_songs=10)
        print(f"Generated {len(recs)} recommendations.")
    except Exception as e:
        print(f"Recommendation error: {e}")
        return jsonify({'error': 'Recommendation failed'}), 500

    return jsonify(recs), 200

@main.route("/users/<user_id>/songs", methods=["POST"])
def swipe(user_id):
    data = request.json
    name = data["name"]
    liked = data["liked"]
    artists = data["artists"]
    albumCover = data["albumCover"]
    externalUrl = data["externalUrl"]
    year = data["year"]

    if liked:
        g.cursor.execute("SELECT id FROM songs WHERE name = %s AND artists = %s AND year = %s;",
                         (name, artists, year))
        result = g.cursor.fetchone()
        if result:
            song_id = result[0]
        else:
            g.cursor.execute("""
                INSERT INTO songs (name, artists, album_cover, external_url, year) 
                VALUES (%s, %s, %s, %s, %s) RETURNING id;
            """, (name, artists, albumCover, externalUrl, year))
            song_id = g.cursor.fetchone()[0]
        g.cursor.execute("""
            INSERT INTO user_songs (user_id, song_id)
            VALUES (%s, %s) ON CONFLICT DO NOTHING;
        """, (user_id, song_id))

    g.db.commit()
    return jsonify({"message": "Swipe recorded"}), 200

# @main.route("/get_users_faves", methods=["GET"])
# def get_users_faves():
#     user_id = request.args.get("user_id")
#     g.cursor.execute("""
#         SELECT s.id, s.song_name, s.artist_name
#         FROM songs s
#         JOIN user_songs us ON us.song_id = s.id
#         WHERE us.user_id = %s;
#     """, (user_id,))
#     rows = g.cursor.fetchall()
#     songs = [{"id": r[0], "title": r[1], "artist": r[2]} for r in rows]
#     return jsonify({"user_id": user_id, "saved_songs": songs}), 200

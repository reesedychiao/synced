import psycopg2
import spotipy
from flask import Flask, request, jsonify, g
from spotipy.oauth2 import SpotifyClientCredentials
import os
from .recommender import recommend_songs, get_song_data
import pandas as pd

app = Flask(__name__)

app.config.update({
    'DB_NAME': os.getenv('DB_NAME'),
    'DB_USER': os.getenv('DB_USER'),
    'DB_PASSWORD': os.getenv('DB_PASSWORD'),
    'DB_HOST': os.getenv('DB_HOST'),
    'DB_PORT': os.getenv('DB_PORT'),
    'SPOTIPY_CLIENT_ID': os.getenv('SPOTIPY_CLIENT_ID'),
    'SPOTIPY_CLIENT_SECRET': os.getenv('SPOTIPY_CLIENT_SECRET'),
})

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=app.config['SPOTIPY_CLIENT_ID'],
    client_secret=app.config['SPOTIPY_CLIENT_SECRET']
))

def init_db(app):
    def connect_db():
        return psycopg2.connect(
            dbname=app.config['DB_NAME'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            host=app.config['DB_HOST'],
            port=app.config['DB_PORT']
        )

    @app.before_request
    def before_request():
        g.db = connect_db()
        g.cursor = g.db.cursor()

    @app.teardown_request
    def teardown_request(exception):
        cursor = g.pop('cursor', None)
        db = g.pop('db', None)
        if cursor: cursor.close()
        if db: db.close()

@app.route("/users/<int:user_id>/songs", methods=["POST"])
def like_song(user_id):
    data = request.json
    print(f"📥 [POST] Like song for user {user_id}: {data}")
    
    spotify_id = data.get('spotify_id')
    if not spotify_id:
        print("❌ Missing spotify_id in request.")
        return jsonify({'error': 'spotify_id is required'}), 400

    # Check if song already exists
    g.cursor.execute("SELECT id FROM songs WHERE spotify_id = %s;", (spotify_id,))
    song = g.cursor.fetchone()

    if not song:
        print("🎵 Song not in DB — inserting...")
        g.cursor.execute("""
            INSERT INTO songs (song_name, artist_name, album_cover_url, spotify_id, genre, tempo)
            VALUES (%s, %s, %s, %s, %s, NULL)
            RETURNING id;
        """, (
            data.get("title", "Unknown"),
            data.get("artist", "Unknown"),
            data.get("album_cover", ""),
            spotify_id,
            data.get("genre", None)
        ))
        song_id = g.cursor.fetchone()[0]
    else:
        song_id = song[0]
        print(f"✅ Song already exists in DB (id={song_id})")

    g.cursor.execute("""
        INSERT INTO user_songs (user_id, song_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING;
    """, (user_id, song_id))
    
    g.db.commit()
    print(f"💾 Song liked and saved (song_id={song_id})")
    return jsonify({'message': 'Song liked successfully!'}), 201

@app.route("/users/<int:user_id>/songs/<int:song_id>/dislike", methods=["POST"])
def dislike_song(user_id, song_id):
    print(f"📥 [POST] Dislike song_id={song_id} for user_id={user_id}")

    g.cursor.execute("SELECT * FROM songs WHERE id = %s;", (song_id,))
    song = g.cursor.fetchone()

    if not song:
        print("❌ Song not found in DB.")
        return jsonify({'error': 'Song not found'}), 404

    g.cursor.execute("""
        INSERT INTO user_dislikes (user_id, song_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING;
    """, (user_id, song_id))

    g.db.commit()
    print(f"👎 Song disliked and recorded.")
    return jsonify({'message': 'Song disliked successfully!'}), 201

# @app.route('/users/<int:user_id>/liked-songs', methods=['GET'])
# def get_liked_songs(user_id):
#     g.cursor.execute("""
#         SELECT s.id, s.song_name, s.artist_name, s.album_cover_url, s.spotify_id
#         FROM songs s
#         JOIN user_songs us ON us.song_id = s.id
#         WHERE us.user_id = %s;
#     """, (user_id,))
#     songs = g.cursor.fetchall()

#     return jsonify([
#         {
#             'id': row[0],
#             'title': row[1],
#             'artist': row[2],
#             'cover_url': row[3],
#             'link': f"https://open.spotify.com/track/{row[4]}"
#         }
#         for row in songs
#     ]), 200

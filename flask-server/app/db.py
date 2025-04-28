import psycopg2
import spotipy
from flask import Flask, request, jsonify, g
from spotipy.oauth2 import SpotifyClientCredentials

app = Flask(__name__) # flask app config

app.config.update({
    'DB_NAME': 'DB_NAME',
    'DB_USER': 'DB_USER',
    'DB_PASSWORD': 'DB_PASSWORD',
    'DB_HOST': 'DB_HOST',
    'DB_PORT': 'DB_PORT',
    'SPOTIPY_CLIENT_ID': 'SPOTIPY_CLIENT_ID',
    'SPOTIPY_CLIENT_SECRET':  'SPOTIPY_CLIENT_SECRET', #for OAUTH
})

def init_db(app):
    def connect_db(): # database connection
        return psycopg2.connect(
            dbname=app.config['DB_NAME'],
            user=app.config['DB_USER'],
            password=app.config['DB_PASSWORD'],
            host=app.config['DB_HOST'],
            port=app.config['DB_PORT'] 
        )
    
    @app.before_request
    def before_request():
        g.db = connect_db() # make the connection before each request
        g.cursor = g.db.cursor() # store the cursor so we can run SQL

    @app.teardown_request
    def teardown_request(exception):
        cursor = g.pop('cursor', None)
        db = g.pop('db', None)
        if cursor:
            cursor.close() # close cursor after request
        if db:
            db.close() # close connection after request


def create_users_table(): # create a users table if it doesn't exist
    data = request.json
    g.cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    g.db.commit()

def create_songs_table():
    g.cursor.execute(""" 
            CREATE TABLE IF NOT EXISTS songs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            song_name VARCHAR(255),
            artist_name VARCHAR(255),
            album_cover_url TEXT,
            spotify_id VARCHAR(100) UNIQUE,
            genre VARCHAR(100),
            tempo FLOAT 
        );
""")
    
def create_user_dislikes_table():
    g.cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_dislikes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
            disliked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, song_id)  -- Prevent multiple dislikes of the same song
        );
    """)
    g.db.commit()

# CRUD implementation (create read update delete)
#insert the user into the database
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    g.cursor.execute(
        "INSERT INTO users (username, email) VALUES (%s, %s) RETURNING id;",
        (data['username'], data['email'])
    )
    user_id = g.cursor.fetchone()[0]
    g.db.commit()
    return jsonify({'id': user_id}), 201


#get user info
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    g.cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = %s;", (user_id,))
    user = g.cursor.fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user[0],
        'username': user[1],
        'email': user[2],
        'created_at': user[3].isoformat()
    })

@app.route('/users/<int:user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    #retrive users liked songs
    g.cursor.execute("""
        SELECT s.spotify_id, s.genre
        FROM songs s
        INNER JOIN user_songs us ON us.song_id = s.id
        WHERE us.user_id = %s;
    """, (user_id,))
    liked_songs = g.cursor.fetchall()

    if not liked_songs:
        return jsonify({'error': 'No liked songs found for user'}), 404

    # store the genre of songs that the user dislikes
    g.cursor.execute("""
        SELECT DISTINCT s.genre
        FROM songs s
        INNER JOIN user_dislikes ud ON ud.song_id = s.id
        WHERE ud.user_id = %s;
    """, (user_id,))
    disliked_genres = [row[0] for row in g.cursor.fetchall()]

    # tracks for Spotify recommendation (up to 5)
    seed_tracks = [song[0] for song in liked_songs][:5]  # Only taking the first 5 liked songs

    #initialize Spotipy client
    sp = spotipy.Spotify(auth_manager=spotipy.oauth2.SpotifyClientCredentials(
        client_id=app.config['SPOTIPY_CLIENT_ID'],
        client_secret=app.config['SPOTIPY_CLIENT_SECRET']
    ))

    # 5. Fetch recommendations based on liked songs
    recommendations = sp.recommendations(
        seed_tracks= seed_tracks, 
        seed_genres=[genre for genre in disliked_genres],  # Avoid disliked genres
        limit=10
    )

    # 6. Format the recommendations response
    recommended_tracks = []
    for track in recommendations['tracks']:
        recommended_tracks.append({
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'album_cover': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'spotify_url': track['external_urls']['spotify']
        })

    return jsonify(recommended_tracks), 200

 
#updating user info
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    songs = request.json 
    g.cursor.execute(
        "UPDATE users SET username = %s, email = %s WHERE id = %s;",
        (data['username'], data['email'], user_id, songs['songs'])
    )
    g.db.commit()
    return jsonify({'message': 'User updated'})

# delete user info
@app.route('/users/<int:user_id>', methods=['DELETE']) 
def delete_user(user_id):
    g.cursor.execute("DELETE FROM users WHERE id = %s;", (user_id,))
    g.db.commit()
    return jsonify({'message': 'User deleted successfully'})

@app.route('/users/<int:user_id>/songs', methods=['POST'])
def like_song(user_id):
    data = request.json
    spotify_id = data['spotify_id']  # Spotify track ID
    name = data['name']
    artist = data['artist']
    album_cover = data.get('album_cover')  # optional
    genre = data.get('genre')  # optional

    # if the song already exists in 'songs' table
    g.cursor.execute("SELECT id FROM songs WHERE spotify_id = %s;", (spotify_id,))
    song = g.cursor.fetchone()

    # If not exist, insert it
    if not song:
        g.cursor.execute(
            """
            INSERT INTO songs (name, artist, album_cover, genre, spotify_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (name, artist, album_cover, genre, spotify_id)
        )
        song_id = g.cursor.fetchone()[0]
    else:
        song_id = song[0]

    # link the song to the user in 'user_songs' table
    g.cursor.execute(
        """
        INSERT INTO user_songs (user_id, song_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING;
        """,
        (user_id, song_id)
    )

    g.db.commit()
    return jsonify({'message': 'Song liked successfully!'}), 201

@app.route('/users/<int:user_id>/songs/<int:song_id>/dislike', methods=['POST'])
def dislike_song(user_id, song_id):
    # 1. Check if the song exists in the songs table
    g.cursor.execute("SELECT * FROM songs WHERE id = %s;", (song_id,))
    song = g.cursor.fetchone()

    if not song:
        return jsonify({'error': 'Song not found'}), 404

    # 2. Insert into the 'user_dislikes' table to track the disliked song
    g.cursor.execute("""
        INSERT INTO user_dislikes (user_id, song_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING;
    """, (user_id, song_id))

    g.db.commit()
    return jsonify({'message': 'Song disliked successfully!'}), 201


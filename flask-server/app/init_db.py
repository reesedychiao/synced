import psycopg2
import os

def create_tables():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    cur = conn.cursor()

    cur.execute("""

    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        song_name VARCHAR(255),
        artist_name VARCHAR(255),
        album_cover_url TEXT,
        spotify_id VARCHAR(100) UNIQUE,
        genre VARCHAR(100),
        tempo FLOAT
    );
    CREATE TABLE IF NOT EXISTS user_songs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        UNIQUE(user_id, song_id)
    );
    CREATE TABLE IF NOT EXISTS user_dislikes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        disliked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, song_id)
    );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Tables created successfully.")

if __name__ == "__main__":
    create_tables()

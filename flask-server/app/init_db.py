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
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS songs CASCADE;
    DROP TABLE IF EXISTS user_songs CASCADE;
                
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        song_name VARCHAR(255),
        artist_name VARCHAR(255),
        year INTEGER
    );
    CREATE TABLE IF NOT EXISTS user_songs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
        UNIQUE(user_id, song_id)
    );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Tables created successfully.")

if __name__ == "__main__":
    create_tables()

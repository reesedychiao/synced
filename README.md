# Synced

**Synced** is a full-stack music recommendation web application that allows users to swipe through song recommendations, like or dislike tracks, and view their saved favorites. It uses a Flask backend, a Next.js frontend, the Spotify API for song metadata, and a machine learning model for generating recommendations.

---

## Features

- OAuth login with GitHub and Google
- Song recommendation system based on liked songs
- Filters out disliked songs to avoid repeats
- Stores liked and disliked songs in a PostgreSQL database
- View your saved liked songs
- Backend recommendation model using scikit-learn clustering

---

## Tech Stack

### Frontend

- **Next.js** with `next-auth` for authentication
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **Spotify API** and **Youtube API** for song information and playback

### Backend

- **Flask** for the API server
- **PostgreSQL** for persistent storage
- **Psycopg2** for database interaction
- **Pandas / NumPy / scikit-learn** for recommendation logic

---

## Setup Instructions

### Backend (Flask)

1. cd flask-server
2. python -m venv .venv
   source .venv/bin/activate
3. pip install -r requirements.txt
4. DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   SPOTIPY_CLIENT_ID=your_spotify_client_id
   SPOTIPY_CLIENT_SECRET=your_spotify_client_secret
5. python run.py

### Frontend (Next.js)

1. cd synced
2. npm install
3. NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
4. npm run dev

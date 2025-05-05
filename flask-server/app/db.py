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

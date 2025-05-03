from flask import Flask
from flask_cors import CORS
from .db import init_db
from .config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    init_db(app)

    from .routes import main
    app.register_blueprint(main)

    return app

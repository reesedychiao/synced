import psycopg2
from flask import Flask, request, jsonify, json, g

app = Flask(__name__) # flask app config

app.config.update({
    'DB_NAME': 'DB_NAME',
    'DB_USER': 'DB_USER',
    'DB_PASSWORD': 'DB_PASSWORD',
    'DB_HOST': 'DB_HOST',
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
    g.cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100)
        );
    """)
    g.db.commit()

def insert_user(name, email):  # insert a user into the users table
    g.cursor.execute("""
        INSERT INTO users (name, email)
        VALUES (%s, %s);
    """, (name, email))
    g.db.commit()

# CRUD implementation (create read update delete)

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
        return jsonify({'error': 'User not found'})
    return jsonify({
        'id': user[0],
        'username': user[1],
        'email': user[2],
        'created_at': user[3].isoformat()
    })
 
#updating user info
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    g.cursor.execute(
        "UPDATE users SET username = %s, email = %s WHERE id = %s;",
        (data['username'], data['email'], user_id)
    )
    g.db.commit()
    return jsonify({'message': 'User updated'})

# delete user info
@app.route('/users/<int:user_id>', methods=['DELETE']) 
def delete_user(user_id):
    g.cursor.execute("DELETE FROM users WHERE id = %s;", (user_id,))
    g.db.commit()
    return jsonify({'message': 'User deleted'})



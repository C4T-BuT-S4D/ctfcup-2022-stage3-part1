import os
from flask import Flask, request, jsonify
from hashlib import md5

CORRECT_HASH = os.environ['CORRECT_HASH']
ALLOWED_REPOS = os.environ['ALLOWED_REPOS'].split(',')

app = Flask(__name__)

@app.route('/', methods=['POST'])
def index():
    if str(request.json.get('repo', {}).get('id', -1)) not in ALLOWED_REPOS:
        return jsonify({'message': 'repo not allowed'}), 400
    if md5(request.json.get('config', {}).get('data', '').encode()).hexdigest() != CORRECT_HASH:
        return jsonify({'message': 'you are forbidden to change the CI file'})
    return '', 200

app.run(host='0.0.0.0', port=5000, debug=True)


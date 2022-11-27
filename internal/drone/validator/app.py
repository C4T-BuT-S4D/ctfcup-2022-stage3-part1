import os
from flask import Flask, request, jsonify
from hashlib import md5

CORRECT_HASH = os.environ['CORRECT_HASH']
ALLOWED_REPOS = os.environ['ALLOWED_REPOS'].split(',')

app = Flask(__name__)

@app.route('/', methods=['POST'])
def index():
    repo = request.json.get('repo', {}).get('slug', '<empty>')
    config_data = request.json.get('config', {}).get('data', '')
    config_hash = md5(config_data.encode()).hexdigest()
    app.logger.info('new request from repo %s, config hash %s, correct %s', repo, config_hash, CORRECT_HASH)
    if repo not in ALLOWED_REPOS:
        return jsonify({'message': 'repo not allowed'}), 400
    if config_hash != CORRECT_HASH:
        return jsonify({'message': 'you are forbidden to change the CI file'}), 400
    return '', 200

app.run(host='0.0.0.0', port=5000, debug=True)


import os
import logging

from flask import Flask, request, jsonify
from hashlib import md5

CORRECT_HASHES = {x[0]: x[1] for x in map(lambda x: x.split(':'), os.environ['CORRECT_HASHES'].split(';'))}
ALLOWED_REPOS = os.environ['ALLOWED_REPOS'].split(',')

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

app.logger.info('Correct hash table: %s', CORRECT_HASHES)
app.logger.info('Allowed repos: %s', ALLOWED_REPOS)

@app.route('/', methods=['POST'])
def index():
    repo = request.json.get('repo', {}).get('slug', '<empty>')
    config_data = request.json.get('config', {}).get('data', '')
    config_hash = md5(config_data.encode()).hexdigest()
    correct_hash = CORRECT_HASHES.get(repo)
    app.logger.info('new request from repo %s, config hash %s, correct %s', repo, config_hash, correct_hash)
    if repo not in ALLOWED_REPOS:
        return jsonify({'message': 'repo not allowed'}), 400
    if config_hash != correct_hash:
        return jsonify({'message': 'you are forbidden to change the CI file'}), 400
    return '', 200

app.run(host='0.0.0.0', port=5000, debug=True)


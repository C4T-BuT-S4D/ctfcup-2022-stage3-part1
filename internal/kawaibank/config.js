const path = require('path');
const fs = require('fs');

const data = fs.readFileSync(path.join(__dirname, 'config.json'));

module.exports = JSON.parse(data);

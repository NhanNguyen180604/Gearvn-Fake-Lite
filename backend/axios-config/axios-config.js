const axios = require('axios');
const SUB_PORT = process.env.SUB_PORT || 8001;
const https = require('https');
const fs = require('fs');
const path = require('path');

const cert = fs.readFileSync(path.join(__dirname, '../sub-system/sslkeys/sub_cert.pem'));
const agent = new https.Agent({ ca: cert });

const instance = axios.create({
    baseURL: `https://localhost:${SUB_PORT}/`,
    httpsAgent: agent,
    timeout: 0,
});

module.exports = instance;
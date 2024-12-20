const asyncHandler = require('express-async-handler');
const axios = require('axios');
const SUB_PORT = process.env.SUB_PORT || 8001;
const https = require('https');
const fs = require('fs');
const path = require('path');

const cert = fs.readFileSync(path.join(__dirname, '../../sub-system/sslkeys/sub_cert.pem'));
const agent = new https.Agent({ ca: cert });

const register = asyncHandler(async (req, res) => {
    const response = await axios.post(`https://localhost:${SUB_PORT}/api/users/register`, {
        username: 'test',
        password: 'testeset',
    }, {
        httpsAgent: agent,
    });
    res.status(response.status).json(response.data);
});

const login = asyncHandler(async (req, res) => {
    
});

const logout = asyncHandler(async (req, res) => {

});

module.exports = {
    register,
    login,
    logout,
};
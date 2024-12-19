const asyncHandler = require('express-async-handler');
const axios = require('axios');
const SUB_PORT = process.env.SUB_PORT || 8001;

const register = asyncHandler(async (req, res) => {

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
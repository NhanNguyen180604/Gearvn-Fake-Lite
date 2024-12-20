const asyncHandler = require('express-async-handler');
const axiosInstance = require('../../axios-config/axios-config');

const register = asyncHandler(async (req, res) => {
    const response = await axiosInstance.post(`/api/users/register`, {
        username: 'test',
        password: 'testeset',
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
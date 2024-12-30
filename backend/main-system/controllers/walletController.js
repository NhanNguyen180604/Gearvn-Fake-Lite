const asyncHandler = require('express-async-handler');
const { clerkClient, getAuth } = require("@clerk/express");
const axiosInstance = require('../../axios-config/axios-config');

const postDeposit = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { cardNumber, expiryDate, ccv, amount } = req.body;
        const token = await req.auth.getToken();
        const response = await axiosInstance.post(`/api/payment/${id}/deposit`,
            {
                cardNumber,
                expiryDate,
                ccv,
                amount: parseInt(amount),
            },
        );
        res.status(response.status).json(response.data);
    }
    catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        throw error;
    }
});

const getBalance = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axiosInstance.get(`/api/payment/${id}`);
        res.status(response.status).json(response.data);
    }
    catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        throw error;
    }
});

module.exports = {
    postDeposit,
    getBalance,
}

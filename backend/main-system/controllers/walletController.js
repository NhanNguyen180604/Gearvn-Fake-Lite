const asyncHandler = require('express-async-handler');
const { clerkClient, getAuth } = require("@clerk/express");
const axiosInstance = require('../../axios-config/axios-config');
const { sign } = require("../others/subsystemSigner");

const postDeposit = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { cardNumber, expiryDate, ccv, amount } = req.body;
        const timestamp = Date.now();
        const payload = {
            cardNumber,
            expiryDate,
            ccv,
            amount: parseInt(amount),
        }
        const response = await axiosInstance.post(`/api/payment/${id}/deposit`,
            payload,
            {
                headers: {
                    "X-Signature": sign(JSON.stringify(payload), timestamp),
                    "X-Timestamp": timestamp.toString()
                }
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
        const timestamp = Date.now();
        const message = "{}";
        const response = await axiosInstance.get(`/api/payment/${id}`, {
            headers: {
                "X-Signature": sign(message, timestamp),
                "X-Timestamp": timestamp.toString()
            }
        });
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

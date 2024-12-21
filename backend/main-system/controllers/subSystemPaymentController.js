const asyncHandler = require('express-async-handler');
const axiosInstance = require('../../axios-config/axios-config');

const pay = asyncHandler(async (req, res) => {
    try {
        const { fullName, phoneNumber, city, district, street } = req.body;
        const token = await req.auth.getToken();
        const response = await axiosInstance.post('/api/payment',
            {
                fullName,
                phoneNumber,
                city,
                district,
                street,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
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

module.exports = {
    pay,
};
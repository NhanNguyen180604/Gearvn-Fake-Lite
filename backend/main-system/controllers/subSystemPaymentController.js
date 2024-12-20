const asyncHandler = require('express-async-handler');
const axiosInstance = require('../../axios-config/axios-config');

const pay = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const token = await req.auth.getToken();
    const response = await axiosInstance.post('/api/payment',
        {
            orderId: orderId,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );
    res.status(response.status).json(response.data);
});

module.exports = {
    pay,
};
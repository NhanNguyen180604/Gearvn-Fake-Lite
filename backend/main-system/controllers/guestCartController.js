const asyncHandler = require('express-async-handler')

const getGuestCart = asyncHandler(async(req, res) => {
    const guestCart = req.session.guestCart || [];
    res.json(guestCart);
});

const postGuestCart = asyncHandler(async(req, res) => {
    const { productId, quantity, image, price, name, max } = req.body;
    let guestCart = req.session.guestCart || [];

    const existingProduct = guestCart.find(item => item._id === productId);

    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        guestCart.push({ _id: productId, quantity, image, price, name, max });
    }

    req.session.guestCart = guestCart;
    res.json(guestCart);
});

const putGuestCart = asyncHandler(async(req, res) => {
    const { productId, quantity } = req.body;
    let guestCart = req.session.guestCart || [];

    const existingProduct = guestCart.find(item => item._id === productId);

    if (existingProduct) {
        existingProduct.quantity = quantity;
    }

    req.session.guestCart = guestCart;
    res.json(guestCart);
});

const deleteGuestCart = asyncHandler(async(req, res) => {
    req.session.guestCart = [];
    res.json([]);
});

module.exports = {
    getGuestCart,
    postGuestCart,
    putGuestCart,
    deleteGuestCart
};

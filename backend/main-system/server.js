const express = require('express');
require('dotenv').config();
const PORT = process.env.MAIN_PORT || 3001;
const fileUpload = require('express-fileupload');
const { clerkMiddleware } = require('@clerk/express');
const cors = require('cors');

const connectDB = require('../db/db');
connectDB();

const app = express();
app.use(cors());

app.use(clerkMiddleware());

app.use(fileUpload({
    limits: {
        fileSize: 30 * 1000 * 1000, // 30 MB
    },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// create role and balance for user when signing up
app.use(require('../middlewares/initializeUser'));

// routes
app.use('/api/sub-system', require('./routes/paymentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/carts', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));

// error handling
app.use(require('../middlewares/errorHandler'));
app.listen(PORT, () => {
    console.log(`Server listen on PORT: ${PORT}`);
});
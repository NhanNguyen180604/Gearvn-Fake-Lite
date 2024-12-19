const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const fileUpload = require('express-fileupload');

const connectDB = require('./db/db');
connectDB();

const app = express();

app.use(fileUpload({
    limits: {
        fileSize: 30 * 1000 * 1000, // 30 MB
    },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

app.use(require('./middlewares/errorHandler'));

app.listen(PORT, () => {
    console.log(`Server listened on port: ${PORT}`);
});
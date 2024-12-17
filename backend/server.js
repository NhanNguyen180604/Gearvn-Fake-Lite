const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const connectDB = require('./db/db');
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use('/api/categories', require('./routes/categoryRoutes'));

app.use(require('./middlewares/errorHandler'));

app.listen(PORT, () => {
    console.log(`Server listened on port: ${PORT}`);
});
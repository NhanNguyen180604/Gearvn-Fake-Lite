const express = require('express');
require('dotenv').config();
const PORT = process.env.SUB_PORT || 8001;
const { createServer } = require('https');
const fs = require('fs');
const path = require('path');
const connectDB = require('../db/db');
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require("./middleware/verifyRequest"));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.use(require('../middlewares/errorHandler'));

const options = {
    key: fs.readFileSync(path.join(__dirname, './sslkeys/sub_key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './sslkeys/sub_cert.pem')),
};
const httpsServer = createServer(options, app);
httpsServer.listen(PORT, () => {
    console.log(`Server listen on PORT: ${PORT}`);
});
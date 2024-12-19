const express = require('express');
require('dotenv').config();
const PORT = process.env.SUB_PORT || 8001;
const { createServer } = require('https');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/', (req, res) => {
    res.status(200).json("Ok");
});

const options = {
    key: fs.readFileSync(path.join(__dirname, './sslkeys/sub_key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './sslkeys/sub_cert.pem')),
};
const httpsServer = createServer(options, app);
httpsServer.listen(PORT, () => {
    console.log(`Server listen on PORT: ${PORT}`);
});
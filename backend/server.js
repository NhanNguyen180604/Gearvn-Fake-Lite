const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.listen(PORT, () => {
    console.log(`Server listened on port: ${PORT}`);
});
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Wallet', walletSchema);
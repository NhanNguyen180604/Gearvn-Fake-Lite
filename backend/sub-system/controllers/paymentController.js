const asyncHandler = require('express-async-handler');
const Wallet = require("../models/walletModel");
const mongoose = require("mongoose");

/**
 * Get the current balance of the user
 * @route /api/payment/:id
 */
const getBalance = asyncHandler(async (req, res) => {
    const wallet = await Wallet.findByIdAndUpdate(req.params.id, {
        $setOnInsert: {
            balance: 0
        }
    }, { upsert: true, returnDocument: "after" });
    res.status(200).json({
        id: wallet._id,
        balance: wallet.balance
    });
});

/**
 * Deposit some money into the wallet
 * @route /api/payment/:id/deposit
 */
const deposit = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { cardNumber, cvv, expiryDate, amount } = req.body;
    await mongoose.connection.transaction(async (session) => {
        const wallet = await Wallet.findById(id, null, { session });
        if (!wallet) {
            res.status(404).json({ message: "Wallet not found" })
            return;
        }
        // Verify card info here, assume that it succeed
        wallet.balance += amount;
        await wallet.save({ session });
        res.status(200).json({
            id, balance: wallet.balance
        })
    })
});

/**
 * Withdraw some money from the wallet
 * @route /api/payment/:id/withdraw
 */
const withdraw = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { amount } = req.body;
    await mongoose.connection.transaction(async (session) => {
        const wallet = await Wallet.findById(id, null, { session });
        if (!wallet) {
            res.status(404).json({ message: "Wallet not found" })
            return;
        }
        if (wallet.balance < amount)
        {
            res.status(400).json({ message: `Balance is too low (${wallet.balance})`});
            return;
        }
        wallet.balance -= amount;
        await wallet.save({ session });
        res.status(200).json({
            id, balance: wallet.balance
        });
    })
});

module.exports = {
    getBalance, deposit, withdraw
}

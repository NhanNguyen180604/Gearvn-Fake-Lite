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
    const { cardNumber, cvv, expiryDate, amount } = req.body;
    // Verify card info here, assume that it succeed
    await mongoose.connection.transaction(async (session) => {
        const wallet = await Wallet.findById(id, null, { session });
        console.log(wallet, amount);
        if (!wallet) {
            res.status(404).json({ message: "Wallet not found" })
            return;
        }
        if (wallet.balance < amount) {
            res.status(400).json({ message: `Balance is too low (${wallet.balance})` });
            return;
        }
        wallet.balance -= amount;
        await wallet.save({ session });
        res.status(200).json({
            id, balance: wallet.balance
        });

        // add money to admin wallet
        const adminWallet = await Wallet.findById(process.env.MAIN_ACCOUNT_ID);
        if (adminWallet) {
            adminWallet.balance += amount;
            await adminWallet.save();
        }
    })
});

/**
 * Withdraw money from guest's card
 * @route /api/payment/guest/withdraw
 */
const withdrawGuest = asyncHandler(async (req, res) => {
    const { cardNumber, cvv, expiryDate, amount } = req.body;
    // verify card info here, assume success
    // check if card's balance still have enough money, assume success
    const cardBalance = amount;
    if (cardBalance < amount) {
        return res.status(400).json({ message: `Balance is too low (${cardBalance})` });
    }
    res.status(200).json({ success: true });

    // add money to admin wallet
    const adminWallet = await Wallet.findById(process.env.MAIN_ACCOUNT_ID);
    if (adminWallet) {
        adminWallet.balance += amount;
        await adminWallet.save();
    }
});

module.exports = {
    getBalance, deposit, withdraw, withdrawGuest,
}

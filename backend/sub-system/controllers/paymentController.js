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
    // Verify card info here, assume that it succeed
    // if (!isValidCardNumber(cardNumber) || !isValidCVV(cvv) || !isValidExpiryDate(expiryDate)) {
    //     res.status(400);
    //     throw new Error("Invalid card info");
    // }

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
    if (!isValidCardNumber(cardNumber) || !isValidCVV(cvv) || !isValidExpiryDate(expiryDate)) {
        res.status(400);
        throw new Error("Invalid card info");
    }

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
    if (!isValidCardNumber(cardNumber) || !isValidCVV(cvv) || !isValidExpiryDate(expiryDate)) {
        res.status(400);
        throw new Error("Invalid card info");
    }
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

const isValidCardNumber = (cardNumber) => {
    if (!/^\d{13,19}$/.test(cardNumber)) return false; // 13-19 digits
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i], 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
};

const isValidExpiryDate = (expiryDate) => {
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false; // MM/YY format
    const [month, year] = expiryDate.split('/').map(Number);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Last two digits of the year
    const currentMonth = now.getMonth() + 1;

    return year > currentYear || (year === currentYear && month >= currentMonth);
};

const isValidCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv); // 3 or 4 digits
};

module.exports = {
    getBalance, deposit, withdraw, withdrawGuest,
}

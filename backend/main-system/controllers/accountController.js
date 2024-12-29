const checkAdmin = require("../../middlewares/checkAdmin");
const asyncHandler = require('express-async-handler');
const { clerkClient, getAuth } = require("@clerk/express");
const axiosInstance = require('../../axios-config/axios-config');

/**
 * Get accounts
 * @route GET /api/account
 * @access admin only
 * @query
 * - `q` (string): query
 * - `page` (number): page number
 * - `per_page` (number): number of users per page
 */
const getAccounts = asyncHandler(async (req, res) => {
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 20;

    page = parseInt(page);
    per_page = parseInt(per_page);

    if (isNaN(page) || page < 1) {
        res.status(400);
        throw new Error("Invalid page number");
    }

    if (isNaN(per_page) || per_page < 1) {
        res.status(400);
        throw new Error("Invalid per_page number");
    }

    const users = await clerkClient.users.getUserList({
        limit: per_page,
        offset: (page - 1) * per_page,
        query: req.query.q,
    });

    res.status(200).json({
        // This is very bad, but whatever
        users: await Promise.all(users.data.map(async u => ({
            id: u.id,
            name: u.username,
            role: u.publicMetadata.role,
            balance: (await axiosInstance.get(`https://localhost:8000/api/payment/${u.id}`)).data.balance
        }))),
        page,
        per_page,
        total_pages: Math.ceil(users.totalCount / per_page),
        total: users.totalCount - 1,
    });
})

/**
 * Get accounts
 * @route DELETE /api/accounts/:id
 * @access admin only
 */
const deleteAccount = asyncHandler(async (req, res) => {
    let id = req.params.id;
    const auth = getAuth(req);
    if (auth.userId === id)
    {
        res.status(400);
        throw new Error("You can't delete yourself");
    }
    await clerkClient.users.deleteUser(id);
    res.status(200).json({ success: true });
})

module.exports = {
    getAccounts,
    deleteAccount
}

const checkAdmin = require("../../middlewares/checkAdmin");
const asyncHandler = require('express-async-handler');
const { clerkClient } = require("@clerk/express");

/**
 * Get accounts
 * @route GET /api/account
 * @access public
 * @query
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
        offset: page * per_page
    });

    res.status(200).json({
        users: users.data.map(u => ({
            id: u.id,
            name: u.username,
            role: u.publicMetadata.role
        })),
        page,
        per_page,
        total_pages: Math.ceil(users.data.length / per_page),
        tota: users.data.length
    });
})

/**
 * Add an account
 * @route POST /api/account
 * @access public
 */
const addAccount = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
    {
        res.status(400);
        throw new Error("Please specify username and password");
    }
    await clerkClient.users.createUser({
        username, password, publicMetadata: {
            role: "user"
        }
    });
})

module.exports = {
    getAccounts, addAccount
}
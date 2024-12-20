const { clerkClient } = require('@clerk/express');

const initializeUser = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        const user = await clerkClient.users.getUser(userId);
        if (!Object.hasOwn(user.publicMetadata, 'role')){
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...user.publicMetadata,
                    role: 'user',
                }
            });
        }
        if (!Object.hasOwn(user.publicMetadata, 'balance')){
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...user.publicMetadata,
                    balance: 999999999,
                }
            });
        }
        next();
    }
    catch (error) {
        next();
    }
};

module.exports = initializeUser;
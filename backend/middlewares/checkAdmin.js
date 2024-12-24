const { clerkClient, getAuth } = require('@clerk/express');

const checkAdmin = async (req, res, next) => {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
        return res.status(401).json("Not authorized");
    }

    const { userId } = auth;
    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata.role !== 'admin') {
        return res.status(401).json("Not authorized");
    }
    req.auth = auth;

    next();
};

module.exports = checkAdmin;
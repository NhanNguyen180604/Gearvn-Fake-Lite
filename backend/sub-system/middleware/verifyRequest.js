const { verify } = require("../others/subsystemVerifier");

const verifyRequest = async (req, res, next) => {
    const message = JSON.stringify(req.body);
    const timestamp = req.header("X-Timestamp");
    const signature = req.header("X-Signature");
    if (!timestamp || !signature)
    {
        res.status(400).json({
            message: "No timestamp or signature"
        });
        return;
    }
    const timestampNum = parseInt(timestamp);
    if (Date.now() - timestampNum >= 30000)
    {
        res.status(400).json({
            message: "Message expired"
        });
        return;
    }
    if (!verify(message, timestampNum, signature))
    {
        res.status(400).json({
            message: "Invalid message"
        });
        return
    }

    next();
};

module.exports = verifyRequest;
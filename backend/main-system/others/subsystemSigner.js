const { createPrivateKey, createSign } = require("crypto")

if (!process.env.MAIN_VERIFY_PRIVATE_KEY)
{
    throw new Error("No private key");
}
const privateKey = createPrivateKey({
    key: Buffer.from(process.env.MAIN_VERIFY_PRIVATE_KEY, "hex"),
    format: "der",
    type: "sec1"
})

const sign = (/** @type string */ str, /** @type number */ timestamp) => {
    const signer = createSign('SHA256');
    signer.write(str.toString());
    signer.write(timestamp.toString()); // very hacky nonce
    signer.end();
    const signature = signer.sign(privateKey, "hex");
    return signature;
}

module.exports = {
    sign
};

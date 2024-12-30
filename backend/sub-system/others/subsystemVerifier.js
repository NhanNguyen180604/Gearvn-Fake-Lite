const { createPublicKey, createVerify } = require("crypto");

if (!process.env.SUB_VERIFY_PUBLIC_KEY)
    throw new Error("No public key for verification");
const publicKey = createPublicKey({
    key: process.env.SUB_VERIFY_PUBLIC_KEY,
    format: "der",
    type: "spki",
    encoding: "hex"
});

const verify = (
    /** @type string */ str,
    /** @type number */ timestamp,
    /** @type string */ signature
) => {
    const verifier = createVerify('SHA256');
    verifier.write(str.toString());
    verifier.write(timestamp.toString()); // very hacky nonce
    verifier.end();
    return verifier.verify(publicKey, signature, "hex");
}

module.exports = {
    verify
};

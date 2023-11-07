import {
  blsCreateProof,
  blsSign,
  blsVerify,
  blsVerifyProof,
  generateBls12381G2KeyPair,
} from "@mattrglobal/bbs-signatures";

const toUint8Array = (str: string) => {
  return Uint8Array.from(Buffer.from(str, "utf-8"));
};

//Generate a new key pair
const keyPair = await generateBls12381G2KeyPair();
// console.log("keyPair", keyPair);
console.log("publicKey", Buffer.from(keyPair.publicKey).toString("hex"));
console.log("secretKey", Buffer.from(keyPair.secretKey).toString("hex"));

//Set of messages we wish to sign
const messages = [
  toUint8Array("message 0"),
  toUint8Array("message 1"),
  toUint8Array("message 2"),
  toUint8Array("message 3"),
  toUint8Array("message 4"),
];

//Create the signature
const signature = await blsSign({
  keyPair,
  messages,
});
console.log("signature", Buffer.from(signature).toString("hex"));

//Verify the signature
const isVerified = await blsVerify({
  publicKey: keyPair.publicKey,
  messages,
  signature,
});
console.log("isVerified", isVerified);

const nonce = toUint8Array("nonce");

//Derive a proof from the signature revealing the first message
const proof = await blsCreateProof({
  signature,
  publicKey: keyPair.publicKey,
  messages,
  nonce,
  revealed: [1, 3],
});
console.log("proof", Buffer.from(proof).toString("hex"));

let args = {
  proof,
  publicKey: keyPair.publicKey,
  messages: [
    // toUint8Array("message 0"),
    toUint8Array("message 1"),
    // toUint8Array("message 2"),
    toUint8Array("message 3"),
    // toUint8Array("message 4"),
  ],
  nonce,
};

console.log({ args });

//Verify the created proof
const isProofVerified = await blsVerifyProof(args);
console.log("isProofVerified", isProofVerified);

// const isProofVerified2 = await blsVerifyProof({
//   proof,
//   publicKey: keyPair.publicKey,
//   // messages: messages.slice(1, 2),
//   messages: [toUint8Array("on ya ya")],
//   nonce,
// });
// console.log("isProofVerified2", isProofVerified2);

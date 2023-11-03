import {
  generateBls12381G2KeyPair,
  blsSign,
  blsVerify,
  blsCreateProof,
  blsVerifyProof,
} from "@mattrglobal/bbs-signatures";

const toUint8Array = (str: string) => {
  return Uint8Array.from(Buffer.from(str, "utf-8"));
}

//Generate a new key pair
const keyPair = await generateBls12381G2KeyPair();
// console.log("keyPair", keyPair);
console.log('publicKey', Buffer.from(keyPair.publicKey).toString('hex'));
console.log('secretKey', Buffer.from(keyPair.secretKey).toString('hex'));

//Set of messages we wish to sign
const messages = [
  toUint8Array("hey hey"),
  toUint8Array("on ya ya"),
];

//Create the signature
const signature = await blsSign({
  keyPair,
  messages,
});
console.log("signature", Buffer.from(signature).toString('hex'));

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
  revealed: [1],
});
console.log("proof", Buffer.from(proof).toString('hex'));

//Verify the created proof
const isProofVerified = await blsVerifyProof({
  proof,
  publicKey: keyPair.publicKey,
  // messages: messages.slice(0, 1),
  messages: [toUint8Array("hey hey")],
  nonce,
});
console.log("isProofVerified", isProofVerified);

const isProofVerified2 = await blsVerifyProof({
  proof,
  publicKey: keyPair.publicKey,
  // messages: messages.slice(1, 2),
  messages: [toUint8Array("on ya ya")],
  nonce,
});
console.log("isProofVerified2", isProofVerified2);

import {
  blsCreateProof,
  blsSign,
  blsVerify,
  blsVerifyProof,
  generateBls12381G2KeyPair,
} from "@mattrglobal/bbs-signatures";

// Convert hex string to Uint8Array

const bytesFromHex = (hex: string): Uint8Array => {
  return new Uint8Array(Buffer.from(hex, "hex"));
};

const bytesFromStr = (str: string) => {
  return Uint8Array.from(Buffer.from(str, "utf-8"));
};

let issuer_pk =
  "b3fe765d4555f036e0b3f13085df20bbcb9cd89251cffcc827064e1f422d4b93596ce998b6a77f462ec4426dd7af2e500978f817e49161e4bea3d2b6accc1232e0770d4468f96b1c9ba68df17235c400c0c38227d6072b24eb1c9ef6ca2add019023629b3c327d2efa0c22e5db7c862a3379f1204fdc4f645b4fa1118a0f80c578a952379b6a4cb58c8662a91eceaed100000005a7c0a9e35644782dc82b26e5bfbfa89318f9ce513283a3a94a6b4c9bb3f0adaf8071bc19e12b39283c04f4dd333c41298a80c754759245837ba440bacb8a9e27d7184ca6c2117d1ea5e6693e1643456e2be29610b540091317ae39fad1403257b2ce15811900944327b0886bd38a6d07bb53f432b5b0886763df380f0f9aa2e5a6446e760122f7d283496cba7adf8ddca428659416790036a35594a67f53768a10fdff25b23b988248e14dcc534c022e39079821ed7cb7f9dffd735b891be694994c70d0aaeaa02faab25d16baf6d8213506f0fbf96e6793dc9b858dcb94ccb68fecbf68393b8efca9e4422b78ce223c";
let proof =
  "000001dcaaefa4e3ffaf058514c8885e0181fbb2a7dfc1b4b44f70f630c169b6cefd836d508fe5159bd4f9a7efa2e370b29338e884c00ac09a7e04e85b7ceaec47b418bd20d7ac82959b0044b2a8e26db3aa2ba2410b353c4f32987b7c7ff0593d6a6ee18e3bca2ade20bc0502d78b765e12bb12d68069a2bfc06bb64ad44d1ba364f7c87068c31a133f22d26df4522b1cc3a78f000000748b873f5626d9b9d431b7bd02b440e6a99e2b05880fdcea3c6d8236bdf9d625cf61bca11331cfa2d5451378a2324701bb0000000257d822fe472b7912e94bec32f154dc1d24c70e39000c4997d89afbd8c883472e5d40d541287369bd825e5b36124c683bf85b18f8e9e2fd3e55f6621790422469b0f0c61c9f122170cfd03c82008fe762409b584c984dda2042987a8d1594e2576b0ef657e4a3a87d3bd4d05c80ddd1580000000505a14083fde681e13031792d5fd02cf6a8c4d0e0d72585391e46a8b5deb1635741b046a141cf938b4145493a8f1fa1db2566aaa9d585c7cc66c356667f643465635cdb0d551ac0b7d45436a1938e9c6f8d88ff9dfd2c90c89b9320f4c25223625a1d191f182a78a9b8917c8f1e5bc5e6b685fbe1e5e8188f58ab34ba99608e2914698c098c4024949ceb90a919d8435a9cf9511e468ca8af127cffed47092c19000000020000000123ff3f4448b0eb344e7a59d5571e17294f9fdbdd498dc92a10f8b400eb17d4210000000323171a25f25dedbd037c567e1740d8a68846ed9b5ff314f38e025e3ef43e0907";
let nonce = "72ad4858d732bdd6f48a1f18849586bc4f30afaa52d866350353e815576f1f23";

let args = {
  proof: bytesFromHex(proof),
  publicKey: bytesFromHex(issuer_pk),
  messages: [
    // toUint8Array("message 0"),
    bytesFromStr("message 1"),
    // toUint8Array("message 2"),
    bytesFromStr("message 3"),
    // toUint8Array("message 4"),
  ],
  nonce: bytesFromHex(nonce),
}

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

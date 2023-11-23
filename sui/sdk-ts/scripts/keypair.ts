import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import fetch from "cross-fetch";
import {
  boundCheck,
  containsClaimDigest,
  inseartClaim,
} from "../src/libs/moveCall/sion/vc/functions";
import {
  isBoundCheckEvent,
  isContainsClaimEvent,
  isVC,
} from "../src/libs/moveCall/sion/vc/structs";
import CryptoJS from "crypto-js";
// import { sha256 } from "js-sha256";
// import sha256 from "crypto-js/sha256";
import crypto from "crypto";

globalThis.fetch = fetch;

const u64ToLEBytes = (number: number): Buffer => {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(number));
  return buffer;
};

const VC_OBJECT_ID =
  "0xc1fd7e0e83f54b75456e3dc0797d97be4eeebe742fe52e1e2b6c92ec22b960aa";

const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

const keypair = () => {
  const secretkey = Buffer.from(
    "AHEZvzwOAc2BbipMw5EqKCvm//GLoXF5iEJqzvBHtj2e",
    "base64",
  ).slice(1);

  console.log({ secretkey });
  return Ed25519Keypair.fromSecretKey(secretkey);
};

// console.log(keypair());

console.log(keypair().getPublicKey());
console.log(keypair().toSuiAddress());

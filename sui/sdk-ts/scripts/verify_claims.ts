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
  containsClaimDigest,
  inseartClaim,
} from "../src/libs/moveCall/sion/vc/functions";
import {
  isContainsClaimEvent,
  isVC,
} from "../src/libs/moveCall/sion/vc/structs";
import CryptoJS from "crypto-js";
import sha256 from "crypto-js/sha256";

globalThis.fetch = fetch;

const VC_OBJECT_ID =
  "0x822b2f97b4e18e96a2f45eba51428fa61afddd38aab96a440c2abdb29f067594";

const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

const keypair = () => {
  const privatekeyHex = (process.env.SUI_PRIVATE_KEY as string).replace(
    /^0x/,
    "",
  );
  const privateKey = Buffer.from(privatekeyHex, "hex");
  return Ed25519Keypair.fromSecretKey(privateKey);
};

const claimList = [
  {
    key: "mileage",
    value: "1345",
  },
  {
    key: "hard_accelerations",
    value: "13",
  },
  {
    key: "hard_brakings",
    value: "45",
  },
];

const vc = await (async () => {
  const txb = new TransactionBlock();
  claimList.forEach((claim) => {
    const digest = sha256(claim.value);
    const hex = digest.toString(CryptoJS.enc.Hex);
    const bytes = Buffer.from(hex, "hex");

    inseartClaim(txb, {
      vc: VC_OBJECT_ID,
      string: claim.key,
      vecU8: Array.from(bytes),
    });
  });
  const result: SuiTransactionBlockResponse = await client
    .signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair(),
      requestType: "WaitForLocalExecution",
      options: {
        showObjectChanges: true,
      },
    });

  return result.objectChanges?.find((obj) =>
    // @ts-ignore
    isVC(obj?.objectType)
  ) as SuiObjectData;
})();

console.log({ vc });
console.log(`https://suiexplorer.com/object/${vc.objectId}?network=testnet`);

{
  const txb = new TransactionBlock();
  claimList.forEach((claim) => {
    const digest = sha256(claim.value);
    const hex = digest.toString(CryptoJS.enc.Hex);
    const bytes = Buffer.from(hex, "hex");

    containsClaimDigest(txb, {
      vc: VC_OBJECT_ID,
      vecU8: Array.from(bytes),
    });
  });

  const result: SuiTransactionBlockResponse = await client
    .signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair(),
      requestType: "WaitForLocalExecution",
      options: {
        showObjectChanges: true,
        showEvents: true,
      },
    });
  console.log(JSON.stringify(result, null, 2));

  let events =
    result.events?.filter((event) => isContainsClaimEvent(event.type)) ?? [];

  let isVerified = Array.from(events).every((event) => (
    event?.parsedJson?.is_verified ?? false
  ));

  console.log({ isVerified });
}

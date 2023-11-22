import {
  getFullnodeUrl,
  SuiClient,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import fetch from "cross-fetch";
import { containsClaimDigest } from "../src/libs/moveCall/sion/vc/functions";
import { isContainsClaimEvent } from "../src/libs/moveCall/sion/vc/structs";

globalThis.fetch = fetch;

const VC_OBJECT_ID =
  "0x6be242e02f4d72622e46b2600688bc6f9c3650d0988e02c886e14b597cc23733";

const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

{
  let result = await client.getDynamicFields({
    parentId:
      "0xbfd76251006e13a932be38cbedb172465fc8a2be32d47d751eee27d295d7f31b",
  });

  console.log(result);
}

{
  let result = await client.getDynamicFields({
    parentId:
      "0x0dede675863aa0c6f4278d4e2c1be3f9fe8c9d1c8429b27234ac9415e1bec5ee",
  });

  console.log(result);
}

// {
//   let result = await client.getDynamicFieldObject({
//     parentId:
//       "0x0dede675863aa0c6f4278d4e2c1be3f9fe8c9d1c8429b27234ac9415e1bec5ee",
//     name: {
//       type: "claims_key_to_digest",
//     },
//   });

//   console.log(result);
// }

{
  let result = await client.getObject({
    id: "0x0dede675863aa0c6f4278d4e2c1be3f9fe8c9d1c8429b27234ac9415e1bec5ee",
    options: {
      showContent: true,
      showDisplay: true,
      showOwner: true,
      showPreviousTransaction: true,
      showStorageRebate: true,
      showType: true,
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

{
  let result = await client.getDynamicFields({
    parentId:
      "0x20e55e9a3b449d48018f69d048a378fc5fa5da2bf2c0ee2f5074025e5dad5713",
  });

  console.log(JSON.stringify(result, null, 2));
}

const keypair = () => {
  const privatekeyHex = (process.env.SUI_PRIVATE_KEY as string).replace(
    /^0x/,
    "",
  );
  const privateKey = Buffer.from(privatekeyHex, "hex");
  return Ed25519Keypair.fromSecretKey(privateKey);
};

{
  const txb = new TransactionBlock();
  containsClaimDigest(txb, {
    vc: VC_OBJECT_ID,
    vecU8: Array.from(Buffer.from("1345")),
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

  let event = result.events?.find((event) => isContainsClaimEvent(event.type));
  console.log({ event });

  console.log(JSON.stringify(result, null, 2));
}

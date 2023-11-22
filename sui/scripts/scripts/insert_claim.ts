import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectChange,
  SuiObjectData,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import fetch from "cross-fetch";
import { inseartClaim } from "../src/libs/moveCall/sion/vc/functions";
import { isVC } from "../src/libs/moveCall/sion/vc/structs";

globalThis.fetch = fetch;

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

const address = keypair().toSuiAddress();
console.log({ address });

const VC_OBJECT_ID =
  "0x6be242e02f4d72622e46b2600688bc6f9c3650d0988e02c886e14b597cc23733";

const vc = await (async () => {
  const txb = new TransactionBlock();
  inseartClaim(txb, {
    vc: VC_OBJECT_ID,
    string: "mileage",
    vecU8: Array.from(Buffer.from("1345")),
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

  console.log(result);

  return result.objectChanges?.find((obj) =>
    // @ts-ignore
    isVC(obj?.objectType)
  ) as SuiObjectData;
})();

console.log({ vc });
console.log(`https://suiexplorer.com/object/${vc.objectId}?network=testnet`);

import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import fetch from "cross-fetch";
import {
  create,
  registerMember,
} from "../src/libs/moveCall/sion/membership-registry/functions";
import { isMembershipRegistry } from "../src/libs/moveCall/sion/membership-registry/structs";
import { isVC } from "../src/libs/moveCall/sion/vc/structs";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";

globalThis.fetch = fetch;

const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

const suiClient = new SuiClient({
  url: "https://sui-rpc.testnet.lgns.net/",
});

const keypair = () => {
  const privatekeyHex = (process.env.SUI_PRIVATE_KEY as string).replace(
    /^0x/,
    "",
  );
  const privateKey = Buffer.from(privatekeyHex, "hex");
  return Ed25519Keypair.fromSecretKey(privateKey);

  // const mnemonic = process.env.SUI_MNEMONIC as string;
  // return Ed25519Keypair.deriveKeypair(mnemonic);
};

const address = keypair().toSuiAddress();
console.log({ address });

const membershipRegistryObject = await (async () => {
  const txb = new TransactionBlock();
  create(txb);
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

  const membershipRegistryObject = result.objectChanges?.find(
    // @ts-ignore
    (obj) => isMembershipRegistry(obj?.objectType),
  );

  return membershipRegistryObject as SuiObjectData;
})();

console.log({ membershipRegistryObject });

const memberAddress =
  "0x6be242e02f4d72622e46b2600688bc6f9c3650d0988e02c886e14b597cc23733";

const vc = await (async () => {
  const txb = new TransactionBlock();
  registerMember(txb, {
    membershipRegistry: membershipRegistryObject.objectId,
    address: memberAddress,
    clock: SUI_CLOCK_OBJECT_ID,
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

  const vc = result.objectChanges?.find(
    // @ts-ignore
    (obj) => isVC(obj?.objectType),
  );

  return vc;
})();

console.log({ vc });

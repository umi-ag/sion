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
import {
  containsClaimDigest,
  inseartClaim,
} from "../src/libs/moveCall/sion/vc/functions";
import {
  create,
  registerMember,
} from "../src/libs/moveCall/sion/membership-registry/functions";
import lodash from "lodash-es";
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

let vcObjectId =
  "0x0dede675863aa0c6f4278d4e2c1be3f9fe8c9d1c8429b27234ac9415e1bec5ee";

const vc = await (async () => {
  const txb = new TransactionBlock();
  inseartClaim(txb, {
    vc: vcObjectId,
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

  return result.objectChanges?.find(
    // @ts-ignore
    (obj) => isVC(obj?.objectType),
  ) as SuiObjectData;
})();

console.log({ vc });
console.log(`https://suiexplorer.com/object/${vc.objectId}?network=testnet`);

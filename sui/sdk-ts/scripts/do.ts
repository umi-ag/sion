import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import fetch from "cross-fetch";
import { containsClaimDigest } from "../src/libs/moveCall/sion/vc/functions";
import {
  isContainsClaimEvent,
  isVC,
} from "../src/libs/moveCall/sion/vc/structs";
import CryptoJS from "crypto-js";
import sha256 from "crypto-js/sha256";
import {
  containsMember,
} from "../src/libs/moveCall/sion/membership-registry/functions";
import {
  isContainsMemberEvent,
} from "../src/libs/moveCall/sion/membership-registry/structs";
import { MembershipPointer } from "../src/libs/moveCall/sion/membership-pointer/structs";
import { obj } from "../src/libs/moveCall/_framework/util";

globalThis.fetch = fetch;

const MEMBERSHIP_REGISTRY_OBJECT_ID =
  "0x8486899823e8d7ad26c336c89f59d5f3937e27f18388a455ad594563d4520d6c";

const MEMBER_ADDRESS =
  "0x640aff861034c71ba7a71488d64152772caa4101842502fed3132deebb550077";

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

const getOwnedMembershipPointerObjectId = async (
  address: string,
) => {
  const data = await client.getOwnedObjects({
    owner: address,
    filter: {
      MatchAll: [
        { StructType: MembershipPointer.$typeName },
        { AddressOwner: address },
      ],
    },
    options: {
      showType: true,
      showOwner: true,
      showPreviousTransaction: true,
      showDisplay: false,
      showContent: false,
      showBcs: false,
      showStorageRebate: false,
    },
  });

  console.log(JSON.stringify(data, null, 2));
  const objectId = data?.data?.[0]?.data?.objectId ?? null;
  return objectId;
};

const getOwnedMembershipObjectId = async (
  address: string,
) => {
  let membershipPointerId = await getOwnedMembershipPointerObjectId(
    MEMBER_ADDRESS,
  );
  if (!membershipPointerId) return null;

  const data = await client.getObject({
    id: membershipPointerId,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  console.log(JSON.stringify(data, null, 2));
  const membershipId = data.data?.content?.fields?.membership_id ?? null;
  return membershipId;
};

const membershipId = await getOwnedMembershipObjectId(MEMBER_ADDRESS);

console.log({ membershipId });

await (async () => {
  const txb = new TransactionBlock();
  containsMember(txb, {
    membershipRegistry: MEMBERSHIP_REGISTRY_OBJECT_ID,
    address: MEMBER_ADDRESS,
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

  let events =
    result.events?.filter((event) => isContainsMemberEvent(event.type)) ?? [];

  console.log({ events });
})();

// const vc = await (async () => {
//   const txb = new TransactionBlock();
//   getVcId(txb, {
//     membershipRegistry: MEMBERSHIP_REGISTRY_OBJECT_ID,
//     address: MEMBER_ADDRESS,
//   });
//   const result: SuiTransactionBlockResponse = await client
//     .signAndExecuteTransactionBlock({
//       transactionBlock: txb,
//       signer: keypair(),
//       requestType: "WaitForLocalExecution",
//       options: {
//         showObjectChanges: true,
//         showEvents: true,
//       },
//     });

//   let events = result.events?.filter((event) => isEntryEvent(event.type)) ?? [];

//   console.log({ events });
// })();

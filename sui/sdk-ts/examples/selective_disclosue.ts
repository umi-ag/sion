import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import fetch from "cross-fetch";
import { sionClient } from "../src/libs/sionClient";
import { isMembership } from "../src/moveCall/sion/membership/structs";
import { CredentialClaim } from "../src/libs/types";
import { sionMoveCall } from "../src/libs/sionTransaction";
import { sionTransactionResponseResolver } from "../src/libs/sionResolver";

globalThis.fetch = fetch;

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

const membershipId = await sionClient.getOwnedMembershipObjectId(client, {
  address: MEMBER_ADDRESS,
});

const claimList: CredentialClaim[] = [
  {
    claim_key: "mileage",
    claim_value: BigInt(0xab),
  },
  {
    claim_key: "hard_accelerations",
    claim_value: BigInt(0x25),
  },
  {
    claim_key: "hard_brakings",
    claim_value: BigInt(0x12),
  },
  {
    claim_key: "traffic_violations",
    claim_value: BigInt(0x123456),
    // value: "2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782edb",
  },
];

const membership = await (async () => {
  const txb = new TransactionBlock();

  sionMoveCall.insertClaims(txb, {
    membershipId,
    claimList,
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
    isMembership(obj?.objectType)
  ) as SuiObjectData;
})();

console.log(
  `https://suiexplorer.com/object/${membership.objectId}?network=testnet`,
);

{
  const txb = new TransactionBlock();

  sionMoveCall.verifyClaimDigest(txb, {
    membershipId,
    claimValueList: [BigInt(0x12), BigInt(0x123456)],
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

  const isVerified = sionTransactionResponseResolver.verifyClaimDigest(result, {
    authenticator: keypair().toSuiAddress(),
  });
  console.log({ isVerified });
}

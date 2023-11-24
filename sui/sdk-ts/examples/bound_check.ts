import {
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
  getFullnodeUrl,
} from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import fetch from 'cross-fetch';
import { sionClient } from '../src/libs/sionClient';
import { isMembership } from '../src/moveCall/sion/membership/structs';
import { CredentialClaim } from '../src/libs/types';
import { sionMoveCall } from '../src/libs/sionTransaction';
import { sionTransactionResponseResolver } from '../src/libs/sionResolver';

globalThis.fetch = fetch;

const MEMBER_ADDRESS = '0x640aff861034c71ba7a71488d64152772caa4101842502fed3132deebb550077';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

const keypair = () => {
  const privatekeyHex = (process.env.SUI_PRIVATE_KEY as string).replace(/^0x/, '');
  const privateKey = Buffer.from(privatekeyHex, 'hex');
  return Ed25519Keypair.fromSecretKey(privateKey);
};

const membershipId = await sionClient.getOwnedMembershipObjectId(client, {
  address: MEMBER_ADDRESS,
});

const claimList: CredentialClaim[] = [
  {
    key: 'mileage',
    value: BigInt(0xab),
  },
  {
    key: 'hard_accelerations',
    value: BigInt(0x25),
  },
  {
    key: 'hard_brakings',
    value: BigInt(0x12),
  },
  {
    key: 'traffic_violations',
    value: BigInt(0x123456),
    // value: "2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782edb",
  },
];

const membership = await (async () => {
  const txb = new TransactionBlock();

  sionMoveCall.insertClaims(txb, {
    membershipId,
    claimList,
  });

  const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: keypair(),
    requestType: 'WaitForLocalExecution',
    options: {
      showObjectChanges: true,
    },
  });

  return result.objectChanges?.find((obj) =>
    // @ts-ignore
    isMembership(obj?.objectType),
  ) as SuiObjectData;
})();

console.log(`https://suiexplorer.com/object/${membership.objectId}?network=testnet`);

const vk =
  '7f13eed31e254fafea5bb0580fba3c45faaf3599b761b84cca53a8b02a0b969c25c558cbc72174c979f6e27f322b447fd725e1a2f3410ab8ea2c3621189f2c2965460ed243a6ffd3f66ffd55f5e15d4508c2cc8dcd71b037869bb5e59e97c8940cc02d588ffbcdd60f2978909ec36d05e6e58704f784dcb3b84226030cd22130208fd4af26e8b216f2708fd5e1c3e018c881e02f5304eb6d8f35be28ea2862ab673e9c24785d00f2cb0230c5b2b54a4f7fa205fc7351037f8490d4da7b246d125ad1895aa96f58cef72499f9c214c1b1d5c57ea6f2c1ab8003d61cbc3483878105000000000000002f93ece505b3e33c4097d9eb909fc3a5e1de9985b0f7f2909b3e48583a711190c7e96691b502151890d34088af349136627209fdd9c03452f5fac140654af6011a39f3e345ed78e366d1358a9e959ab270de21202d6b882fed71370a30f7e8a6c7cd12655e6fcaa37ae806da99986624ef6d4b00ef7285170a87de9dcc16050793245d44d7f02d9aa697889066ee3051e4d28f3c4b2622e92727a224ba156181';
const public_inputs =
  '2b596e4b230759a22d18592d73c889dc1f67b0d3ebc082f2c0c32bb379782e00db000000000000000000000000000000000000000000000000000000000000003412000000000000000000000000000000000000000000000000000000000000efcdab0000000000000000000000000000000000000000000000000000000000';
const proof =
  'fbf494771ec217856d27b007e3c83e3559edfc80f607abe40fd4b293a5094996cbf1b373825f0789a07e857b27f2392b744123f144f0a9bf5c7faf632d6ec6025caff02ad444b6811f569257f56a46cf09b00c0a5dc788fcda922b0025cf351184ca392eb5a90ea466fbff8810efe7fe6a4cab9fd57935a242af29ade9e8ed20';

{
  const txb = new TransactionBlock();
  sionMoveCall.boundCheck(txb, {
    membershipId: membershipId,
    claimKey: 'traffic_violations',
    lower_bound_gte: BigInt(0x1234),
    upper_bound_le: BigInt(0xabcdef),
    proof: Buffer.from(proof, 'hex'),
    vk: Buffer.from(vk, 'hex'),
  });

  const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: keypair(),
    requestType: 'WaitForLocalExecution',
    options: {
      showObjectChanges: true,
      showEvents: true,
    },
  });
  console.log(JSON.stringify(result, null, 2));

  const isVerified = sionTransactionResponseResolver.verifyBoundCheck(result, {
    authenticator: keypair().toSuiAddress(),
  });
  console.log({ isVerified });
}

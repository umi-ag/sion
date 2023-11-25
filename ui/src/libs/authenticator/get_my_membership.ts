import {
  SuiClient,
  SuiObjectData,
  SuiTransactionBlockResponse,
  getFullnodeUrl,
} from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { sionClient, sionMoveCall } from 'sion-sdk';
import { authenticator } from '../moveCall/sion/membership/functions';
import { authenticatorKeypair } from './config';

const MEMBERSHIP_REGISTRY_OBJECT_ID =
  '0xd502ca0400850ac97627a3ed38c0344c7e9644e406d3912d9b97d4ddc891c49e';

const MEMBER_ADDRESS = '0x640aff861034c71ba7a71488d64152772caa4101842502fed3132deebb550077';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

const membershipId = await sionClient.getOwnedMembershipObjectId(client, {
  address: MEMBER_ADDRESS,
});

console.log({ membershipId });

// await (async () => {
//   const txb = new TransactionBlock();
//   sionMoveCall.containsMember(txb, {
//     membershipRegistry: MEMBERSHIP_REGISTRY_OBJECT_ID,
//     address: MEMBER_ADDRESS,
//   });
//   const result: SuiTransactionBlockResponse = await client.signAndExecuteTransactionBlock({
//     transactionBlock: txb,
//     signer: authenticatorKeypair(),
//     requestType: 'WaitForLocalExecution',
//     options: {
//       showObjectChanges: true,
//       showEvents: true,
//     },
//   });

//   const events = result.events?.filter((event) => isContainsMemberEvent(event.type)) ?? [];

//   console.log({ events });
// })();

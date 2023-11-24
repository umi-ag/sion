import { SerializedSignature } from '@mysten/sui.js/cryptography';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { genAddressSeed, getZkLoginSignature } from '@mysten/zklogin';
import { suiClient } from 'src/config/sui';
import { OauthState, ZkLoginState } from 'src/store';

export type MoveCallSponsoredProps = {
  txb: TransactionBlock;
  oauth: OauthState;
  zkLogin: ZkLoginState;
};
export const moveCallSponsored = async ({
  txb,
  zkLogin: { salt, ephemeralSecretKeyStr, zkLoginAddress, zkProof, maxEpoch },
  oauth: { aud, sub },
}: MoveCallSponsoredProps) => {
  if (!zkProof) {
    throw new Error('zkProof is not defined');
  }

  txb.setSender(zkLoginAddress);
  const payloadBytes = await txb.build({
    client: suiClient,
    onlyTransactionKind: true,
  });

  const res = await fetch('/api/sponsor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payloadBytes: Buffer.from(payloadBytes).toString('hex'),
      userAddress: zkLoginAddress,
    }),
  });
  const sponsoredResponse = await res.json();

  const gaslessTxb = TransactionBlock.from(sponsoredResponse.txBytes);

  const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
    Buffer.from(ephemeralSecretKeyStr, 'base64'),
  );
  const { bytes, signature: userSignature } = await gaslessTxb.sign({
    client: suiClient,
    signer: ephemeralKeyPair,
  });

  const addressSeed = genAddressSeed(BigInt(salt), 'sub', sub, aud).toString();

  // Serialize the zkLogin signature by combining the ZK proof (inputs), the maxEpoch,
  // and the ephemeral signature (userSignature).
  const zkLoginSignature: SerializedSignature = getZkLoginSignature({
    inputs: {
      ...zkProof,
      addressSeed,
    },
    maxEpoch,
    userSignature,
  });

  // Execute the transaction
  const r = await suiClient.executeTransactionBlock({
    transactionBlock: bytes,
    signature: [zkLoginSignature, sponsoredResponse.signature],
    requestType: 'WaitForLocalExecution',
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log('r', r);

  return r;
};

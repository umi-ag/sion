import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { ZKProof, ZkProofParams } from 'src/types';

const PROVER_URL = 'https://zklogin-prover-fe.fly.dev/v1';

export const fetchZkProof = async ({
  maxEpoch,
  jwtRandomness,
  extendedEphemeralPublicKey,
  jwt,
  salt,
}: ZkProofParams) => {
  console.log('fetchZkProof', {
    maxEpoch,
    jwtRandomness,
    extendedEphemeralPublicKey,
    jwt,
    salt,
  });
  const r = await fetch(PROVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      maxEpoch,
      jwtRandomness,
      extendedEphemeralPublicKey,
      jwt,
      salt,
      keyClaimName: 'sub',
    }),
  });

  if (!r.ok) {
    console.error(await r.json());
    return;
  }

  const json = await r.json();
  return json as ZKProof;
};

export const serializeKeypair = (keypair: Ed25519Keypair) => {
  const ser = JSON.stringify(keypair);
  return ser;
};

export const deserializeKeypair = (ser: string) => {
  const des = JSON.parse(ser);
  des.keypair.publicKey = new Uint8Array(Object.values(des.keypair.publicKey));
  des.keypair.secretKey = new Uint8Array(Object.values(des.keypair.secretKey));
  return new Ed25519Keypair(des.keypair);
};

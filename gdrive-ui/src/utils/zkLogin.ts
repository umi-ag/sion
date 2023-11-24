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

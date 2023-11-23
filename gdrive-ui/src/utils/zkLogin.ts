import { ZkProofParams } from 'src/types';

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
  const url = `${PROVER_URL}/get_zk_proof`;
  const r = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      maxEpoch,
      jwtRandomness,
      extendedEphemeralPublicKey,
      jwt,
      salt,
    }),
  });

  if (!r.ok) {
    console.error(await r.json());
    return;
  }

  const json = await r.json();
  return json;
};

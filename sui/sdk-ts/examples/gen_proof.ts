import fetch from 'cross-fetch';
globalThis.fetch = fetch;

{
  const res = await fetch('https://sion-prover.fly.dev/gen-proof', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      value: BigInt(121).toString(),
      lowerBoundGte: BigInt(100).toString(),
      upperBoundLt: BigInt(200).toString(),
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error));

  console.log(res);
}

import { ProverClient } from 'src/libs';

const proverClient = new ProverClient('https://sion-prover.fly.dev');

const verifier = await proverClient.boundCheck({
  value: BigInt(121),
  lowerBoundGte: BigInt(100),
  upperBoundLt: BigInt(200),
});

console.log(verifier);

console.log({
  proof: Buffer.from(verifier.proof, 'hex'),
  vk: Buffer.from(verifier.vk, 'hex'),
});

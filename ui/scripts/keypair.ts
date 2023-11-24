import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

const keypair = new Ed25519Keypair();
// console.log('keypair', keypair);
const pk = keypair.getPublicKey().toSuiAddress();
const sk = keypair.export().privateKey;
// console.log('pk', pk);
// console.log('sk', sk);

// const ser = JSON.stringify(keypair);
// console.log('ser', ser);

// const des = JSON.parse(ser);
// console.log('des.keypair', des.keypair);
// des.keypair.publicKey = new Uint8Array(Object.values(des.keypair.publicKey));
// des.keypair.secretKey = new Uint8Array(Object.values(des.keypair.secretKey));
// // des.keypair.privateKey = new Uint8Array(Object.values(des.keypair.privateKey));

// console.log('des', des);

// // const r2 = new Ed25519Keypair.(des.keypair);

// const restored = new Ed25519Keypair(des.keypair);
// const pkr = restored.getPublicKey().toSuiAddress();
// const skr = restored.export().privateKey;
// console.log('pkr', pkr);
// console.log('skr', skr);

// console.log('pk === pkr', pk === pkr);
// console.log('sk === skr', sk === skr);

const serializeKeypair = (keypair: Ed25519Keypair) => {
  const ser = JSON.stringify(keypair);
  return ser;
};

const deserializeKeypair = (ser: string) => {
  const des = JSON.parse(ser);
  des.keypair.publicKey = new Uint8Array(Object.values(des.keypair.publicKey));
  des.keypair.secretKey = new Uint8Array(Object.values(des.keypair.secretKey));
  return new Ed25519Keypair(des.keypair);
};

const ser = serializeKeypair(keypair);
console.log('ser', ser);

const des = deserializeKeypair(ser);
console.log('des', des);

// const pkr = des.getPublicKey().toSuiAddress();
// const skr = des.export().privateKey;

// console.log('pkr', pkr);
// console.log('skr', skr);

const pk2 = des.getPublicKey().toSuiAddress();
const sk2 = des.export().privateKey;
console.log('pk2', pk2);
console.log('sk2', sk2);

console.log('pk === pk2', pk === pk2);
console.log('sk === sk2', sk === sk2);

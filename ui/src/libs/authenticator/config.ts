import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

const AUTHENTICATOR_SECRET_KEY = 'AHEZvzwOAc2BbipMw5EqKCvm//GLoXF5iEJqzvBHtj2e';

export const authenticatorKeypair = () => {
  const secretkey = Buffer.from(AUTHENTICATOR_SECRET_KEY, 'base64').slice(1);
  return Ed25519Keypair.fromSecretKey(secretkey);
};

export const MEMBERSHIP_REGISTRY_OBJECT_ID =
  '0xd05196b65134ddaa2637a66938c1ff9879e6d0120bff0080f941db3814da7019 ';

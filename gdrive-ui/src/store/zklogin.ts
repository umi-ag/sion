import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { OpenIdProvider, ZKProof } from 'src/types';
import { getLoginUrl } from 'src/utils/getLoginUrl';

export type ZkLoginState = {
  provider: OpenIdProvider;
  maxEpoch: number;
  jwtRandomness: string;
  ephemeralSecretKeyStr: string;
  ephemeralPublicKeyStr: string;
  salt: string;
  nonce: string; // maxEpoch + randomness + ephemeralPublicKey
  zkLoginAddress: string; // jwt + salt
  zkProofs: ZKProof | null; // fetch from prover server
};
export type DerivedZkLoginState = {
  ephemeralKeypair: Ed25519Keypair;
  loginUrl: string; // nonce + provider
};

export const zkLoginStateAtom = atomWithStorage<ZkLoginState>('zklogin-state', {
  provider: 'Google',
  maxEpoch: 0,
  jwtRandomness: '',
  ephemeralSecretKeyStr: '',
  ephemeralPublicKeyStr: '',
  salt: '',
  nonce: '',
  zkLoginAddress: '',
  zkProofs: null,
});

export const zkLoginAtom = atom(
  (get) => {
    const { ephemeralSecretKeyStr, provider, nonce } = get(zkLoginStateAtom);
    const ephemeralKeyPair = Ed25519Keypair.deriveKeypairFromSeed(ephemeralSecretKeyStr);
    const loginUrl = getLoginUrl({ nonce, provider });

    return {
      ...get(zkLoginStateAtom),
      ephemeralKeyPair,
      loginUrl,
    };
  },
  (_, set, update) => {
    set(zkLoginStateAtom, update as ZkLoginState);
  },
);

export type ZkLoginInit = {
  provider?: OpenIdProvider;
  maxEpoch?: number;
  salt?: string;
};
export const initZkLoginState = ({
  provider = 'Google',
  maxEpoch = 1,
  salt = '',
}: ZkLoginInit = {}) => {
  const jwtRandomness = generateRandomness();
  const ephemeralKeyPair = new Ed25519Keypair();
  const pk = ephemeralKeyPair.getPublicKey();
  const ephemeralPublicKeyStr = pk.toSuiBytes();
  const ephemeralSecretKeyStr = ephemeralKeyPair.export().privateKey;
  const nonce = generateNonce(pk as never, maxEpoch, jwtRandomness);

  const [_, setZkLoginAtom] = useAtom(zkLoginAtom);

  setZkLoginAtom({
    provider,
    maxEpoch,
    jwtRandomness,
    ephemeralSecretKeyStr,
    ephemeralPublicKeyStr,
    nonce,
    salt,
    zkLoginAddress: '',
    zkProofs: null,
  });
};

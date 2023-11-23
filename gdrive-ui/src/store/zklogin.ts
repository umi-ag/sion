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

export type ZkLoginInit = {
  provider?: OpenIdProvider;
  maxEpoch?: number;
  salt?: string;
};
export const defaultZkLoginState = ({
  provider = 'Google',
  maxEpoch = 1,
  salt = '',
}: ZkLoginInit = {}) => {
  const jwtRandomness = generateRandomness();
  const ephemeralKeyPair = new Ed25519Keypair();
  const pk = ephemeralKeyPair.getPublicKey();
  const ephemeralPublicKeyStr = pk.toSuiAddress();
  const ephemeralSecretKeyStr = ephemeralKeyPair.export().privateKey;
  const nonce = generateNonce(pk as never, maxEpoch, jwtRandomness);

  return {
    provider,
    maxEpoch,
    jwtRandomness,
    ephemeralSecretKeyStr,
    ephemeralPublicKeyStr,
    nonce,
    salt,
    zkLoginAddress: '',
    zkProofs: null,
  };
};

export const persistedZkLoginAtom = atomWithStorage<ZkLoginState>(
  'zklogin-state',
  defaultZkLoginState(),
);

export const zkLoginAtom = atom(
  (get) => {
    const { ephemeralSecretKeyStr, provider, nonce } = get(persistedZkLoginAtom);
    const ephemeralKeyPair = Ed25519Keypair.deriveKeypairFromSeed(ephemeralSecretKeyStr);
    const loginUrl = getLoginUrl({ nonce, provider });

    return {
      ...get(persistedZkLoginAtom),
      ephemeralKeyPair,
      loginUrl,
    };
  },
  (_, set, update: ZkLoginState) => {
    set(persistedZkLoginAtom, update);
  },
);

export const useZkLogin = () => {
  const [zkLogin, setZkLogin] = useAtom(zkLoginAtom);

  const initZkLoginState = () => {
    setZkLogin(defaultZkLoginState());
  };

  return {
    zkLogin,
    setZkLogin,
    initZkLoginState,
  };
};

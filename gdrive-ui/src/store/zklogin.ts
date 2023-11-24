import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui.js/keypairs/ed25519';
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
} from '@mysten/zklogin';
import { toBigIntBE } from 'bigint-buffer';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { OpenIdProvider, ZKProof, ZkProofParams } from 'src/types';
import { getLoginUrl } from 'src/utils/getLoginUrl';
import { loadStorage } from 'src/utils/storage';
import { fetchZkProof } from 'src/utils/zkLogin';
import useSWR, { SWRConfiguration } from 'swr';
import { jwtAtom, persistedOauthAtom } from '.';

export type ZkLoginState = {
  provider: OpenIdProvider;
  maxEpoch: number;
  jwtRandomness: string;
  ephemeralSecretKeyStr: string;
  ephemeralPublicKeyStr: string;
  salt: string;
  nonce: string; // maxEpoch + randomness + ephemeralPublicKey
  zkLoginAddress: string; // jwt + salt
  zkProof: ZKProof | null; // fetch from prover server
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
  // ephemeralKeyPair.
  // const ephemeralPublicKeyStr = toBigIntBE(
  //   Buffer.from(ephemeralKeyPair.getPublicKey().toSuiBytes()),
  // ).toString();
  // console.log('1', ephemeralPublicKeyStr);
  // console.log('2', ephemeralKeyPair.getPublicKey().toSuiAddress());
  const ephemeralSecretKeyStr = ephemeralKeyPair.export().privateKey;
  // ephemeralKeyPair;
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
    zkProof: null,
  };
};

export const persistedZkLoginAtom = atomWithStorage<ZkLoginState>(
  'zklogin-state',
  loadStorage('zklogin-state') ?? defaultZkLoginState(),
);

export const zkLoginAtom = atom(
  (get) => {
    const { ephemeralSecretKeyStr, ephemeralPublicKeyStr, provider, nonce } =
      get(persistedZkLoginAtom);
    const ephemeralKeyPair = Ed25519Keypair.deriveKeypairFromSeed(ephemeralSecretKeyStr);
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
      // ephemeralKeyPair.getPublicKey() as never,
      new Ed25519PublicKey(ephemeralPublicKeyStr) as never,
    );
    const loginUrl = getLoginUrl({ nonce, provider });

    return {
      ...get(persistedZkLoginAtom),
      ephemeralKeyPair,
      extendedEphemeralPublicKey,
      loginUrl,
    };
  },
  (_, set, update: ZkLoginState) => {
    set(persistedZkLoginAtom, update);
  },
);

export const useZkProof = (params: ZkProofParams, config?: SWRConfiguration) => {
  // console.log('useZk', params);
  const shouldFetch = !!params.jwt;
  const key = shouldFetch ? ['zkproof', ...Object.values(params)] : null;
  const { data, ...rest } = useSWR(key, () => fetchZkProof(params), config);

  return {
    zkProof: data ?? null,
    ...rest,
  };
};

export const useZkLogin = () => {
  const [zkLogin, setZkLogin] = useAtom(zkLoginAtom);
  const [jwt] = useAtom(jwtAtom);

  const initZkLoginState = () => {
    setZkLogin(defaultZkLoginState());
  };

  const setZkLoginAddress = (jwt: string) => {
    setZkLogin({
      ...zkLogin,
      zkLoginAddress: jwtToAddress(jwt, zkLogin.salt),
    });
  };

  const zkProofQuery = useZkProof({
    maxEpoch: zkLogin.maxEpoch,
    jwtRandomness: zkLogin.jwtRandomness,
    extendedEphemeralPublicKey: zkLogin.ephemeralPublicKeyStr,
    salt: zkLogin.salt,
    jwt,
  });

  return {
    zkLogin,
    setZkLogin,
    initZkLoginState,
    setZkLoginAddress,
    zkProofQuery,
  };
};

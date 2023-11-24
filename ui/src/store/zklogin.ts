import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
} from '@mysten/zklogin';
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { suiClient } from 'src/config/sui';
import { OpenIdProvider, ZKProof, ZkProofParams } from 'src/types';
import { useGetLoginUrl } from 'src/utils/getLoginUrl';
import { deserializeKeypair, fetchZkProof, serializeKeypair } from 'src/utils/zkLogin';
import useSWR, { SWRConfiguration } from 'swr';
import { jwtAtom } from '.';

export type ZkLoginState = {
  provider: OpenIdProvider;
  maxEpoch: number;
  jwtRandomness: string;
  ephemeralSecretKeyStr: string;
  ephemeralPublicKeyStr: string;
  ephemeralKeypairStr: string;
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
  maxEpoch = 1000,
  salt = '0',
}: ZkLoginInit = {}) => {
  const jwtRandomness = generateRandomness();
  const ephemeralKeyPair = new Ed25519Keypair();
  const pk = ephemeralKeyPair.getPublicKey();
  const ephemeralKeypairStr = serializeKeypair(ephemeralKeyPair);
  const ephemeralPublicKeyStr = pk.toSuiAddress();
  const ephemeralSecretKeyStr = ephemeralKeyPair.export().privateKey;
  const nonce = generateNonce(pk as never, maxEpoch, jwtRandomness);

  return {
    provider,
    maxEpoch,
    jwtRandomness,
    ephemeralSecretKeyStr,
    ephemeralPublicKeyStr,
    ephemeralKeypairStr,
    nonce,
    salt,
    zkLoginAddress: '',
    zkProof: null,
  };
};

export const persistedZkLoginAtom = atomWithStorage<ZkLoginState>(
  'zklogin-state',
  defaultZkLoginState(),
);

export const zkLoginAtom = atom(
  (get) => {
    const { ephemeralKeypairStr, salt } = get(persistedZkLoginAtom);
    const jwt = get(jwtAtom);
    const ephemeralKeyPair = deserializeKeypair(ephemeralKeypairStr);
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
      ephemeralKeyPair.getPublicKey() as never,
    );
    const zkLoginAddress = jwt && jwtToAddress(jwt, salt);

    const ret = {
      ...get(persistedZkLoginAtom),
      ephemeralKeyPair,
      extendedEphemeralPublicKey,
      zkLoginAddress,
      jwt,
    };
    console.log({ ret });
    return ret;
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

export const useCurrentEpoch = () => {
  const fetcher = () => suiClient.getLatestSuiSystemState();
  const shouldFetch = true;
  const key = shouldFetch ? ['current-epoch'] : null;
  const { data, ...rest } = useSWR(key, fetcher, { revalidateOnFocus: false });

  return {
    currentEpoch: Number(data?.epoch ?? 0),
    ...rest,
  };
};

export const useZkLogin = () => {
  const [zkLogin, setZkLogin] = useAtom(zkLoginAtom);
  const [jwt] = useAtom(jwtAtom);
  const currentEpochQuery = useCurrentEpoch();
  const loginUrl = useGetLoginUrl({ nonce: zkLogin.nonce, provider: zkLogin.provider });

  const initZkLoginState = (init: ZkLoginInit = {}) => {
    const maxEpoch = currentEpochQuery.currentEpoch + (init.maxEpoch ?? 2);
    const state = defaultZkLoginState({
      ...init,
      maxEpoch,
      salt: '1',
    });
    setZkLogin(state);
    return state;
  };

  // const setZkLoginAddress = (jwt: string) => {
  //   setZkLogin({
  //     ...zkLogin,
  //     // zkLoginAddress: jwtToAddress(jwt, zkLogin.salt),
  //   });
  // };

  const zkProofQuery = useZkProof(
    {
      maxEpoch: zkLogin.maxEpoch,
      jwtRandomness: zkLogin.jwtRandomness,
      extendedEphemeralPublicKey: zkLogin.extendedEphemeralPublicKey,
      salt: zkLogin.salt,
      jwt,
    },
    {
      revalidateOnFocus: false,
      onSuccess: (zkProof) => {
        setZkLogin({
          ...zkLogin,
          zkProof,
        });
      },
    },
  );

  return {
    zkLogin,
    loginUrl,
    // ephemeralKeyPair,
    setZkLogin,
    initZkLoginState,
    // setZkLoginAddress,
    zkProofQuery,
    currentEpochQuery,
  };
};

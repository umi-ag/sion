import config from 'src/config/config.json';
import { OpenIdProvider, ZkLoginState } from 'src/types';
import { StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { generateNonce, generateRandomness, jwtToAddress } from '@mysten/zklogin';
import { toBigIntBE } from 'bigint-buffer';
import { decodeJwt } from 'jose';
import { match } from 'ts-pattern';

const MAX_EPOCH = 1; // keep ephemeral keys active for this many Sui epochs from now (1 epoch ~= 24h)
const API_KEY = 'AIzaSyDII8ecl6Kzef3ccXh9XYt-kHIWWcFtbqk';

export const useZkLoginSetup = create<ZkLoginState>(
  persist(
    (set, get) => ({
      provider: 'Google',
      ephemeralPrivateKey: '',
      ephemeralPublicKey: '',
      maxEpoch: 0,
      randomness: '',
      nonce: '',
      loginUrl: () => {
        return getLoginUrl({
          nonce: get().nonce,
          provider: get().provider,
        });
      },
      userAddr: '',
      jwt: '',
      sub: '',
      aud: '',
      zkProofs: null,
      salt: () => '',
      isProofsLoading: false,
      beginZkLogin: async (provider) => {
        // const { epoch } = await suiClient.getLatestSuiSystemState();
        // const maxEpoch = Number(epoch) + MAX_EPOCH; // the ephemeral key will be valid for MAX_EPOCH from now
        const maxEpoch = 1000;
        const ephemeralKeyPair = new Ed25519Keypair();
        const randomness = generateRandomness();

        set({
          provider,
          maxEpoch,
          ephemeralPublicKey: toBigIntBE(
            Buffer.from(ephemeralKeyPair.getPublicKey().toSuiBytes()),
          ).toString(),
          ephemeralPrivateKey: ephemeralKeyPair.export().privateKey,
          randomness,
        });

        const nonce = generateNonce(ephemeralKeyPair.getPublicKey() as never, maxEpoch, randomness);
        set({ randomness, nonce });
      },
      completeZkLogin: async (account) => {
        set({
          provider: account.provider as OpenIdProvider,
          maxEpoch: account.maxEpoch,
          ephemeralPublicKey: account.ephemeralPublicKey,
          ephemeralPrivateKey: account.ephemeralPrivateKey,
          randomness: account.randomeness,
        });

        if (!get().jwt) {
          get().getJwt();
          const userAddr = jwtToAddress(get().jwt, get().salt());
          set({ userAddr });
        }

        if (!account.zkProofs) {
          set({ isProofsLoading: true });
          const zkproofs = await getZkProof({
            maxEpoch: get().maxEpoch,
            jwtRandomness: get().randomness,
            extendedEphemeralPublicKey: get().ephemeralPublicKey,
            jwt: get().jwt,
            salt: get().salt(),
          });

          set({ zkProofs: zkproofs });
          set({ isProofsLoading: false });
        }
      },
      getJwt: () => {
        const urlFragment = window.location.hash.substring(1);
        const urlParams = new URLSearchParams(urlFragment);
        const jwt = urlParams.get('id_token');

        // remove URL fragment
        window.history.replaceState(null, '', window.location.pathname);

        if (!jwt) return;

        const jwtPayload = decodeJwt(jwt);
        if (!jwtPayload.sub || !jwtPayload.aud) {
          console.warn('[completeZkLogin] missing jwt.sub or jwt.aud');
          return;
        }

        set({
          jwt,
          sub: jwtPayload.sub,
          aud: typeof jwtPayload.aud === 'string' ? jwtPayload.aud : jwtPayload.aud[0],
        });
      },
      account: () => ({
        provider: get().provider,
        userAddr: get().userAddr,
        zkProofs: get().zkProofs,
        ephemeralPublicKey: get().ephemeralPublicKey,
        ephemeralPrivateKey: get().ephemeralPrivateKey,
        userSalt: get().salt(),
        jwt: get().jwt,
        sub: get().sub,
        aud: get().aud,
        maxEpoch: get().maxEpoch,
        randomeness: get().randomness,
      }),
      loginStatus() {
        if (!get().jwt) {
          return 'loggedOut';
        }
        return 'loggedIn';
      },
      accessToken: '',
      parseUrlHash: (hash) => {
        const urlParams = new URLSearchParams(hash);
        const jwt = urlParams.get('id_token');
        const accessToken = urlParams.get('access_token');

        if (jwt) {
          const jwtPayload = decodeJwt(jwt);
          if (!jwtPayload.sub || !jwtPayload.aud) {
            console.warn('[completeZkLogin] missing jwt.sub or jwt.aud');
            return;
          }

          set({
            jwt,
            sub: jwtPayload.sub,
            aud: typeof jwtPayload.aud === 'string' ? jwtPayload.aud : jwtPayload.aud[0],
          });
        }

        if (accessToken) {
          set({ accessToken });
        }
      },
      files: [],
      listFiles: async () => {
        const url = `https://www.googleapis.com/drive/v3/files?key=${API_KEY}`;
        const accessToken = get().accessToken;

        const r = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!r.ok) {
          console.error(await r.json());
          return;
        }

        const json = await r.json();
        // console.log(json);

        set({ files: json.files });
      },
      createFile: async () => {},
    }),
    {
      name: 'zkLoginSetup',
    },
  ) as StateCreator<ZkLoginState, [], []>,
);

const getLoginUrl = (props: { provider: OpenIdProvider; nonce: string }) => {
  const REDIRECT_URI = `${window.location.origin}/login`;
  const urlParamsBase = {
    nonce: props.nonce,
    redirect_uri: REDIRECT_URI,
    response_type: 'id_token token',
    scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive'].join(' '),
  };
  console.log(urlParamsBase);

  const loginUrl = match(props.provider)
    .with('Google', () => {
      const urlParams = new URLSearchParams({
        ...urlParamsBase,
        client_id: config.CLIENT_ID_GOOGLE,
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${urlParams}`;
      // return `https://www.googleapis.com/auth/drive.file?${urlParams}`;
    })
    .with('Twitch', () => {
      const urlParams = new URLSearchParams({
        ...urlParamsBase,
        client_id: config.CLIENT_ID_TWITCH,
        force_verify: 'true',
        lang: 'en',
        login_type: 'login',
      });
      return `https://id.twitch.tv/oauth2/authorize?${urlParams}`;
    })
    .with('Facebook', () => {
      const urlParams = new URLSearchParams({
        ...urlParamsBase,
        client_id: config.CLIENT_ID_FACEBOOK,
      });
      return `https://www.facebook.com/v18.0/dialog/oauth?${urlParams}`;
    })
    .exhaustive();

  return loginUrl;
};

const getZkProof = async (props: {
  maxEpoch: number;
  jwtRandomness: string;
  extendedEphemeralPublicKey: string;
  jwt: string;
  salt: string;
}) => {
  // azure
  // const url = "https://prover.umilabs.org/v1";
  // fly.io
  const url = 'https://zklogin-prover-fe.fly.dev/v1';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      maxEpoch: props.maxEpoch,
      jwtRandomness: props.jwtRandomness,
      extendedEphemeralPublicKey: props.extendedEphemeralPublicKey,
      jwt: props.jwt,
      salt: props.salt,
      keyClaimName: 'sub',
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const zkProofs = await response.json();
  return zkProofs;
};

import { decodeJwt } from 'jose';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type OauthState = {
  // oauth
  urlHash: string;
  jwt: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
};

export const defaultOauthState = (): OauthState => ({
  urlHash: '',
  jwt: '',
  aud: '',
  sub: '',
  iat: 0,
  exp: 0,
  name: '',
  email: '',
  picture: '',
  accessToken: '',
});

export const oauthStateAtom = atomWithStorage<OauthState>('oauth-state', defaultOauthState());

export const oauthAtom = atom(
  (get) => {
    const { jwt } = get(oauthStateAtom);
    const loginStatus = jwt ? 'loggedIn' : 'loggedOut';

    return {
      ...get(oauthStateAtom),
      loginStatus,
    };
  },
  (_, set, update: OauthState) => {
    set(oauthStateAtom, update);
  },
);

// export const initOauthState = () => {
//   const [_, setOauthAtom] = useAtom(oauthAtom);
//   setOauthAtom({
//     urlHash: '',
//     jwt: '',
//     aud: '',
//     sub: '',
//     iat: 0,
//     exp: 0,
//     name: '',
//     email: '',
//     picture: '',
//     accessToken: '',
//   });
// };

export const parseUrlHash = (urlHash: string) => {
  const urlParams = new URLSearchParams(urlHash);
  const jwt = urlParams.get('id_token');
  const accessToken = urlParams.get('access_token') ?? '';

  if (!jwt) {
    throw new Error('missing jwt');
  }

  // const [_, setOauthAtom] = useAtom(oauthAtom);

  const payload = decodeJwt(jwt);
  if (!payload.sub || !payload.aud) {
    throw new Error('missing jwt.sub or jwt.aud');
  }
  const aud = typeof payload.aud === 'string' ? payload.aud : payload.aud[0];
  const sub = payload.sub;
  const iat = payload.iat ?? 0;
  const exp = payload.exp ?? 0;
  const name = (payload.name as string) ?? '';
  const email = (payload.email as string) ?? '';
  const picture = (payload.picture as string) ?? '';

  // setOauthAtom({
  //   urlHash,
  //   jwt,
  //   sub,
  //   aud,
  //   iat,
  //   exp,
  //   name,
  //   email,
  //   picture,
  //   accessToken,
  // });
  return {
    urlHash,
    jwt,
    sub,
    aud,
    iat,
    exp,
    name,
    email,
    picture,
    accessToken,
  };
};

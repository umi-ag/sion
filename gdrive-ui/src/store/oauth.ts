import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type OauthState = {
  // oauth
  urlHash: string;
  jwt: string;
  aud: string;
  sub: string;
  iat: string;
  exp: string;
  name: string | null;
  email: string | null;
  picture: string | null;
  accessToken: string;
};

export const oauthStateAtom = atomWithStorage<OauthState>('oauth-state', {
  urlHash: '',
  jwt: '',
  aud: '',
  sub: '',
  iat: '',
  exp: '',
  name: null,
  email: null,
  picture: null,
  accessToken: '',
});

export type DerivedOauthState = {
  // derived from oauth
  loginStatus: 'loggedOut' | 'loggedIn';
};
export const oauthAtom = atom(
  (get) => {
    const { jwt } = get(oauthStateAtom);
    const loginStatus = jwt ? 'loggedIn' : 'loggedOut';

    return {
      ...get(oauthStateAtom),
      loginStatus,
    };
  },
  (_, set, update) => {
    set(oauthStateAtom, update as OauthState);
  },
);

export const initOauthState = () => {
  const [_, setOauthAtom] = useAtom(oauthAtom);
  setOauthAtom({
    urlHash: '',
    jwt: '',
    aud: '',
    sub: '',
    iat: '',
    exp: '',
    name: null,
    email: null,
    picture: null,
    accessToken: '',
  });
};

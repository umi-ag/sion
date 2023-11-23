import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { parseUrlHash } from 'src/utils/url';

export type OauthState = {
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

export const persistedOauthAtom = atomWithStorage<OauthState>('oauth-state', defaultOauthState());

export const oauthAtom = atom(
  (get) => {
    const { jwt } = get(persistedOauthAtom);
    const loginStatus = jwt ? 'loggedIn' : 'loggedOut';

    return {
      ...get(persistedOauthAtom),
      loginStatus,
    };
  },
  (_, set, update: OauthState) => {
    set(persistedOauthAtom, update);
  },
);

export const useOauth = () => {
  const [oauth, setOauth] = useAtom(oauthAtom);

  const initOauthState = () => {
    setOauth(defaultOauthState());
  };

  const completeOauth = (urlHash: string) => {
    const update = parseUrlHash(urlHash);
    setOauth(update);
  };

  return {
    oauth,
    setOauth,
    initOauthState,
    completeOauth,
  };
};

import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { loadStorage } from 'src/utils/storage';

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

export const persistedOauthAtom = atomWithStorage<OauthState>(
  'oauth-state',
  loadStorage('oauth-state') ?? defaultOauthState(),
);

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

  return {
    oauth,
    setOauth,
    initOauthState,
  };
};

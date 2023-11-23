import { decodeJwt } from 'jose';

export const getUrlHash = () => {
  const urlFragment = window.location.hash.substring(1);
  return urlFragment;
};

export const removeUrlHash = () => {
  // remove URL fragment
  window.history.replaceState(null, '', window.location.pathname);
};

export const parseUrlHash = (urlHash: string) => {
  const urlParams = new URLSearchParams(urlHash);
  const jwt = urlParams.get('id_token');
  const accessToken = urlParams.get('access_token') ?? '';

  if (!jwt) {
    throw new Error('missing jwt');
  }

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

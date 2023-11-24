import { useEffect, useState } from 'react';
import config from 'src/config/config.json';
import { OpenIdProvider } from 'src/types';
import { match } from 'ts-pattern';

const useRidirectUrl = () => {
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/login`);
    }
  }, []);

  return [redirectUri, setRedirectUri] as const;
};

export const useGetLoginUrl = (props: { provider: OpenIdProvider; nonce: string }) => {
  const [redirect_uri] = useRidirectUrl();
  const urlParamsBase = {
    nonce: props.nonce,
    redirect_uri,
    response_type: 'id_token token',
    scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive'].join(' '),
  };

  const loginUrl = match(props.provider)
    .with('Google', () => {
      const urlParams = new URLSearchParams({
        ...urlParamsBase,
        client_id: config.CLIENT_ID_GOOGLE,
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${urlParams}`;
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

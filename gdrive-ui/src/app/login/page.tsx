'use client';

import { useAtom } from 'jotai';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import {
  defaultOauthState,
  defaultZkLoginState,
  oauthAtom,
  parseUrlHash,
  zkLoginAtom,
} from 'src/store';
import { getUrlHash } from 'src/utils/url';
import { LoginButton } from './LoginButton';

const Page = () => {
  // const zkLoginStore = useZkLoginSetup();
  const [zkLogin, setZkLoginState] = useAtom(zkLoginAtom);
  const [_oauth, setOauthState] = useAtom(oauthAtom);

  const initLoginState = () => {
    setZkLoginState(defaultZkLoginState());
    setOauthState(defaultOauthState());
  };

  const login = async () => {
    // await zkLoginStore.beginZkLogin('Google');
    // const loginUrl = zkLoginStore.loginUrl();
    // window.location.href = loginUrl;
    initLoginState();
    console.log('loginUrl', zkLogin.loginUrl);
    window.location.href = zkLogin.loginUrl;
  };

  useEffect(() => {
    const hash = getUrlHash();
    if (hash) {
      const tokens = parseUrlHash(hash);
      setOauthState(tokens);
      redirect('/gdrive');
    }
  }, [setOauthState]);

  return (
    <div className="grid place-items-center min-h-full">
      <div className="pb-32">
        <p className="text-center text-xl mb-8">Welcome to Sion</p>

        <div className="grid place-items-center mb-4">
          <LoginButton onClick={login} />
        </div>

        {/* <pre suppressHydrationWarning>{JSON.stringify(zkLoginStore, null, 2)}</pre> */}
      </div>
    </div>
  );
};

export default Page;

'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useOauth, useZkLogin } from 'src/store';
import { getUrlHash } from 'src/utils/url';
import { LoginButton } from './LoginButton';

const Page = () => {
  const { zkLogin, initZkLoginState } = useZkLogin();
  const { initOauthState, completeOauth } = useOauth();

  const initLoginState = () => {
    initZkLoginState();
    initOauthState();
  };

  const login = async () => {
    initLoginState();
    window.location.href = zkLogin.loginUrl;
  };

  useEffect(() => {
    const hash = getUrlHash();
    if (hash) {
      completeOauth(hash);
      redirect('/gdrive');
    }
  }, [completeOauth]);

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

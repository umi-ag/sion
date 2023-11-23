'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useOauth, useZkLogin } from 'src/store';
import { getUrlHash, parseUrlHash } from 'src/utils/url';
import { LoginButton } from './LoginButton';

const Page = () => {
  const { zkLogin, initZkLoginState, setZkLoginAddress } = useZkLogin();
  const { initOauthState, setOauth } = useOauth();

  const initLoginState = () => {
    initZkLoginState();
    initOauthState();
  };

  const startLogin = async () => {
    initLoginState();
    window.location.href = zkLogin.loginUrl;
  };

  const completeLogin = (hash: string) => {
    const newOauthState = parseUrlHash(hash);
    setOauth(newOauthState);
    setZkLoginAddress(newOauthState.jwt);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const hash = getUrlHash();
    if (hash) {
      completeLogin(hash);
      redirect('/gdrive');
    }
  }, []);

  return (
    <div className="grid place-items-center min-h-full">
      <div className="pb-32">
        <p className="text-center text-xl mb-8">Welcome to Sion</p>

        <div className="grid place-items-center mb-4">
          <LoginButton onClick={startLogin} />
        </div>
      </div>

      <p>
        <Link href="/gdrive" className="text-blue-400 underline">
          gdrive
        </Link>
      </p>
    </div>
  );
};

export default Page;

'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useOauth, useZkLogin } from 'src/store';
import { getUrlHash, parseUrlHash } from 'src/utils/url';
import { lalezar } from '../fonts';
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
    console.log('zkLogin', zkLogin.loginUrl, zkLogin);
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
      redirect('/certificates');
    }
  }, []);

  return (
    <div className="grid place-items-center h-screen">
      <div className="pb-32">
        <p className={`text-center text-8xl mb-8 ${lalezar.className}`}>SION</p>

        <div className="grid place-items-center mb-4">
          <LoginButton onClick={startLogin} />
        </div>

        <p>
          <Link href="/gdrive" className="text-blue-400 underline">
            gdrive
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useOauth, useZkLogin } from 'src/store';
import { getLoginUrl } from 'src/utils/getLoginUrl';
import { getUrlHash, parseUrlHash } from 'src/utils/url';
import { lalezar } from '../fonts';
import { LoginButton } from './LoginButton';

const Page = () => {
  const { initZkLoginState, setZkLoginAddress } = useZkLogin();
  const { initOauthState, setOauth } = useOauth();

  const initLoginState = () => {
    const zkLogin = initZkLoginState();
    const oauth = initOauthState();
    return { zkLogin, oauth };
  };

  const startLogin = async () => {
    const states = initLoginState();
    const loginUrl = getLoginUrl({
      nonce: states.zkLogin.nonce,
      provider: states.zkLogin.provider,
    });
    window.location.href = loginUrl;
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

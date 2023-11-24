'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { FooterMenu } from 'src/components/FooterMenu';
import { useOauth, useZkLogin } from 'src/store';

export default function AuthorizedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { oauth, initOauthState } = useOauth();
  const { initZkLoginState } = useZkLogin();
  const router = useRouter();

  const logout = () => {
    initOauthState();
    initZkLoginState();
    router.push('/login');
  };

  useEffect(() => {
    if (!oauth.jwt) {
      router.push('/login');
    }
  }, [oauth, router]);

  return (
    <>
      {children}

      <div className="absolute bottom-0 left-0 w-full">
        <FooterMenu />
      </div>

      <div className="fixed bottom-0 right-0 p-4">
        <button className="btn btn-primary" onClick={logout}>
          Log out
        </button>
      </div>
    </>
  );
}

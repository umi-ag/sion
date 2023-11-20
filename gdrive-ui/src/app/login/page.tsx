'use client';

import { useZkLoginSetup } from 'src/store/zklogin';
import { LoginButton } from './LoginButton';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

const urlHash = () => {
  const urlFragment = window.location.hash.substring(1);
  // remove URL fragment
  window.history.replaceState(null, "", window.location.pathname);

  return urlFragment;
}

const Page = () => {
  const zkLoginStore = useZkLoginSetup();

  useEffect(() => {
    const hash = urlHash();
    if (hash) {
      zkLoginStore.parseUrlHash(hash);
      redirect('/gdrive');
    }
  }, [zkLoginStore]);

  return (
    <div className='grid place-items-center h-full'>
      <div className="pb-32">
        <p className='text-center text-xl mb-4'>
          Welcome to Sion
        </p>

        <div className="grid place-items-center mb-4">
          <LoginButton onClick={() => zkLoginStore.beginZkLogin('Google')} />
        </div>

        {/* <pre suppressHydrationWarning>{JSON.stringify(zkLoginStore, null, 2)}</pre> */}
      </div>
    </div>
  )
}

export default Page;

'use client';

import { redirect } from 'next/navigation';
import { useOauth } from 'src/store';

const Page = () => {
  const { oauth } = useOauth();

  if (!oauth.jwt) {
    redirect('/login');
  } else {
    redirect('/gdrive');
  }
};

export default Page;

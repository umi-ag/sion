'use client';

import { redirect } from 'next/navigation';
import { useOauth } from 'src/store/oauth';

import 'src/store/gdrive';
import 'src/store/zklogin';

const Page = () => {
  const { oauth } = useOauth();

  if (!oauth.jwt) {
    redirect('/login');
  } else {
    redirect('/gdrive');
  }
};

export default Page;

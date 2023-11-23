'use client';

import { redirect } from 'next/navigation';
import { useZkLoginSetup } from 'src/store/__zklogin';

const Page = () => {
  const zkLoginStore = useZkLoginSetup();

  if (!zkLoginStore.jwt) {
    redirect('/login');
  } else {
    redirect('/gdrive');
  }
};

export default Page;

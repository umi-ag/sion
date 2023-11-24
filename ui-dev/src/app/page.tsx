'use client';

import { redirect } from 'next/navigation';
import { useOauth } from 'src/store';


const Page = () => {
  useOauth();

  redirect('/gdrive');
};

export default Page;

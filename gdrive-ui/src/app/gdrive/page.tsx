'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useZkLoginSetup } from 'src/store/zklogin';

const Page = () => {
  const zkLoginStore = useZkLoginSetup();

  useEffect(() => {
    if (!zkLoginStore.jwt || !zkLoginStore.accessToken) {
      redirect('/login');
    }
  }, [zkLoginStore]);

  return (
    <div>
      <h1>gdrive</h1>
      <p>
        <Link href="/login" className="text-blue-400 underline">
          Login
        </Link>
      </p>

      <div>
        <button className="border border-black px-4 py-1 rounded" onClick={zkLoginStore.listFiles}>
          List
        </button>
      </div>
      <ul>
        {zkLoginStore.files.map(file => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Page;

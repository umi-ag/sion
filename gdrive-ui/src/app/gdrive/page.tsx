'use client';

import { useAtom } from 'jotai';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { oauthAtom } from 'src/store';

const Page = () => {
  const [oauth] = useAtom(oauthAtom);

  useEffect(() => {
    if (oauth.loginStatus === 'loggedOut') {
      redirect('/login');
    }
  }, [oauth]);

  return (
    <div>
      <h1>gdrive</h1>
      <p>
        <Link href="/login" className="text-blue-400 underline">
          Login
        </Link>
      </p>

      <div>
        <button className="border border-black px-4 py-1 rounded" onClick={() => {}}>
          List
        </button>
      </div>
      <ul>
        {/* {zkLoginStore.files.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))} */}
      </ul>
    </div>
  );
};

export default Page;

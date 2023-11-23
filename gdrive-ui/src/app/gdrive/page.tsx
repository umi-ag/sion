'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useGdrive, useOauth } from 'src/store';

const Page = () => {
  const { oauth } = useOauth();
  const { listFilesQuery } = useGdrive();

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
      {listFilesQuery.isLoading && <p>Loading...</p>}
      <ul>
        {listFilesQuery.files.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
